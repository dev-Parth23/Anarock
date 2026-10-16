# Run 3 delta - 2026-10-16 (HEAD 7734eaa at start; app source identical to 783060d / b504988)
Method: re-executed checks. `git diff 783060d..origin/main -- anarock package.json` is empty (log: 01_git_pull_run3.log). Findings baseline unchanged: 16 items (1 critical, 3 high, 8 medium, 3 low, 1 info). No new, no resolved.
- npm ci: FAILS (lock out of sync: Missing @emnapi/core@1.11.3, @emnapi/runtime@1.11.3). Executed (02_npm_ci_run3.log).
- npm audit: 13 vulns (1 critical, 10 high, 2 moderate) - identical. Executed (02_npm_audit_run3.log).
- next lint: 1 error (list-your-property/page.js:993 react/no-unescaped-entities) + 4 warnings; next build FAILS on that error (lint gate). Identical. Executed (03_lint_build_run3.log).
- Semgrep 1.181.0 (p/javascript, p/nextjs, p/owasp-top-ten, p/secrets): canary known-bad sample = 3 findings (rules fire); anarock/src = 0 findings, 0 errors. Executed (06_sast_semgrep_run3.log).
- Secret scan, working tree + full history (51 commits, incl. report commits): 0 hits; no tracked .env/.pem/.key; no .env.example. Executed (05_secret_scan_run3.log).
- GitHub secret scanning (run_secret_scanning): "Repository does not have GitHub Advanced Security enabled" - NOT possible. Executed call, blocked.
- OWASP ZAP baseline: NOT RUN - no ZAP, Docker CLI present but daemon unavailable.
- API tests run3: PASS=46 FAIL=33 (08_api_tests_run3.log). Browser/axe run3: PASS=86 FAIL=17 of 103 (09_browser_tests_run3.log) - matches the first-run baseline exactly. API delta vs baseline 45/34 is one sitemap-host check (NEXT_PUBLIC_BASE_URL set at start).
- CRM (AnarockCRM, read-only: getOrganization, getRecordCount x3): org production/professional/100 licences/paid to 2026-12-22. Properties=7295, Push_to_Website=true=393, Leads Lead_Source='Listing Platform'=7 - all identical to run 2. Modules/fields not re-queried.
- Scope doc: repo copy unchanged. Slack copy and Slack project-tracker hours not re-fetched this run.
- Dev server run with no Zoho/Catalyst credentials; no CRM write attempted. App code, README unchanged (still accurate).
