// FusionHawk browser test runner (Playwright + axe-core). Usage: NODE_PATH=<dir with playwright-core, axe-core> node run_browser_tests.js http://localhost:3111
const { chromium } = require('playwright-core'); console.log('# tools: playwright-core', require('playwright-core/package.json').version, 'axe-core', require('axe-core/package.json').version, '(pin: playwright-core@1.56.1, axe-core@4.10.2)'); const fs = require('fs'); const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const B = process.argv[2] || 'http://localhost:3111'; let pass = 0, fail = 0;
const chk = (id, d, ok, actual) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(6)} ${d}${actual !== undefined ? '  -> ' + actual : ''}`); };
(async () => {
  console.log(`# Browser tests ${new Date().toISOString()} target=${B}`);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const pages = ['/', '/properties', '/shortlist', '/compare', '/list-your-property', '/services', '/kyc/city/delhi', '/properties/1/test-property'];
  const noisy = /Failed to load resource|CATALYST_|ZOHO_|Failed to fetch cities|Fetch failed|Suggested properties|CityPage|loadProperty/; // errors caused by missing credentials in this test env
  for (const [name, vp] of [['desktop', { width: 1366, height: 800 }], ['mobile', { width: 375, height: 740 }]]) {
    console.log(`\n## ${name} ${vp.width}x${vp.height}`);
    const ctx = await b.newContext({ viewport: vp }); const page = await ctx.newPage();
    for (const p of pages) {
      const errs = []; page.removeAllListeners('console'); page.removeAllListeners('pageerror');
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('PAGEERR ' + e));
      const t0 = Date.now(); let st = 0; try { const r = await page.goto(B + p, { waitUntil: 'networkidle', timeout: 45000 }); st = r.status(); } catch (e) { st = 'ERR'; }
      const ms = Date.now() - t0;
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h1: document.querySelectorAll('h1').length, imgNoAlt: [...document.images].filter(i => i.getAttribute('alt') === null).length, lang: document.documentElement.lang, text: document.body.innerText.slice(0, 20000) }));
      chk('PAGE', `${p} loads (HTTP ${st}, ${ms}ms)`, st === 200 || (p.includes('abc') && st === 404));
      chk('LAYOUT', `${p} no horizontal scroll`, m.sw <= m.cw, `scrollWidth=${m.sw} clientWidth=${m.cw}`);
      const unexpected = errs.filter(e => !noisy.test(e)); chk('JS', `${p} no unexpected console/page errors`, unexpected.length === 0, unexpected.slice(0, 2).join(' | ').slice(0, 160));
      const leaked = /CATALYST_[A-Z_]+ is missing|ZOHO_[A-Z_]+ is missing/.test(m.text); chk('UI', `${p} does not show internal env-var errors to the user`, !leaked, leaked ? 'visible on page' : '');
      await page.addScriptTag({ content: axeSrc }); const ax = await page.evaluate(async () => { const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }); return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length })); });
      const serious = ax.filter(v => ['critical', 'serious'].includes(v.impact)); chk('A11Y', `${p} axe: no critical/serious WCAG2.1 A/AA violations`, serious.length === 0, serious.map(v => `${v.id}(${v.impact},${v.n})`).join(', ') + (ax.length ? ` | all: ${ax.map(v => v.id + ':' + v.n).join(',')}` : ''));
      if (name === 'mobile' && (p === '/' || p === '/properties')) await page.screenshot({ path: `/tmp/claude-0/shot_${p === '/' ? 'home' : 'props'}_mobile.png` });
    }
    if (name === 'desktop') {
      console.log('\n## Internal link crawl (home + header/footer)');
      await page.goto(B + '/', { waitUntil: 'networkidle' }); const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => h && h.startsWith('/') && !h.startsWith('//')))]);
      for (const h of hrefs) { const r = await ctx.request.get(B + h.split('#')[0]); chk('LINK', `GET ${h}`, r.status() < 400, r.status()); }
      const ext = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="http"]')].map(a => a.href))]); console.log('      external links:', ext.length);
      const nonoopener = await page.evaluate(() => [...document.querySelectorAll('a[target="_blank"]')].filter(a => !/noopener/.test(a.rel)).length); chk('SEC', 'target=_blank links have rel=noopener', nonoopener === 0, `${nonoopener} without`);
      console.log('\n## Cookie consent & storage');
      const c2 = await b.newContext({ viewport: vp }); const pg = await c2.newPage(); await pg.goto(B + '/', { waitUntil: 'networkidle' });
      const banner = await pg.locator('text=/cookie/i').first().isVisible().catch(() => false); chk('COOKIE', 'consent banner visible on first visit', banner);
      const cookies = await c2.cookies(); chk('COOKIE', 'no cookies set before consent', cookies.length === 0, cookies.map(c => c.name).join(','));
      console.log('\n## Home page UI form (client-side validation only; nothing is submitted)');
      const open = pg.locator('button:has-text("Request"), button:has-text("Callback"), button:has-text("Post")').first();
      chk('FORM', 'a lead CTA button exists on home', await open.count() > 0);
      await c2.close();
    }
    await ctx.close();
  }
  console.log(`\n# SUMMARY: PASS=${pass} FAIL=${fail} TOTAL=${pass + fail}`); await b.close();
})();
