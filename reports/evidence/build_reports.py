#!/usr/bin/env python3
"""Builds the four FusionHawk PDFs (Security, Code Review, Test Scenarios, Scope Completeness) for one run.
All tables are populated from this run's evidence logs in the same folder or from findings verified in this run.
Usage: python3 build_reports.py <repo_root> <date YYYY-MM-DD> <short_commit>"""
import sys, os, re, math, glob, json
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from xml.sax.saxutils import escape

ROOT, DATE, COMMIT = sys.argv[1], sys.argv[2], sys.argv[3]
EV = os.path.join(ROOT, "reports", "evidence")
OUT = os.path.join(ROOT, "reports")
LOGO = os.path.join(EV, "fusionhawk_logo.png")
PURPLE = colors.HexColor("#5b2a86"); GREY = colors.HexColor("#f2f2f5"); LINE = colors.HexColor("#c9c9d3")
SEVCOL = {"Critical": "#b00020", "High": "#d9480f", "Medium": "#b8860b", "Low": "#2b6cb0", "Info": "#555555"}
STCOL = {"Complete": "#1b7f3b", "Partial": "#b8860b", "Not started": "#b00020", "Not verifiable": "#555555", "PASS": "#1b7f3b", "FAIL": "#b00020"}

ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontSize=16, textColor=PURPLE, spaceAfter=4, spaceBefore=8)
H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontSize=12, textColor=PURPLE, spaceAfter=3, spaceBefore=8)
B = ParagraphStyle("B", parent=ss["BodyText"], fontSize=8.6, leading=11.2, spaceAfter=3)
SM = ParagraphStyle("SM", parent=B, fontSize=7.2, leading=8.8, spaceAfter=0)
SMB = ParagraphStyle("SMB", parent=SM, fontName="Helvetica-Bold")
TITLE = ParagraphStyle("T", parent=ss["Title"], fontSize=21, textColor=PURPLE, alignment=0, spaceAfter=2)
SUB = ParagraphStyle("S", parent=B, fontSize=9, textColor=colors.HexColor("#444444"))

def P(t, st=B): return Paragraph(t, st)
def E(t): return escape(str(t))

def col(s):
    c = SEVCOL.get(s) or STCOL.get(s)
    return f'<font color="{c}"><b>{E(s)}</b></font>' if c else E(s)

_TAG = re.compile(r"<(?!/?(?:b|br|font|i)\b)")
def fix(t): return _TAG.sub("&lt;", t)
def P(t, st=B): return Paragraph(fix(t), st)
def table(rows, widths, header=True, font=SM, zebra=True, colcols=None):
    """rows: list of lists of str (already-escaped markup allowed through Paragraph)."""
    data = []
    for i, r in enumerate(rows):
        data.append([c if not isinstance(c, str) else Paragraph(fix(c), SMB if (header and i == 0) else font) for c in r])
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    st = [("GRID", (0, 0), (-1, -1), 0.25, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
          ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3),
          ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2)]
    if header: st.append(("BACKGROUND", (0, 0), (-1, 0), GREY))
    if zebra:
        for i in range(2, len(rows), 2): st.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#fafafc")))
    t.setStyle(TableStyle(st))
    return t

class Doc(BaseDocTemplate):
    def __init__(self, path, title, **kw):
        super().__init__(path, pagesize=landscape(A4), leftMargin=12*mm, rightMargin=12*mm, topMargin=20*mm, bottomMargin=14*mm,
                         title=title, author="FusionHawk", **kw)
        self.rtitle = title
        fr = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="f", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate(id="p", frames=[fr], onPage=self.deco)])
    def deco(self, c, d):
        c.saveState()
        w, h = landscape(A4)
        try: c.drawImage(LOGO, 12*mm, h-16*mm, height=9*mm, width=9*mm*5.0, preserveAspectRatio=True, mask="auto", anchor="sw")
        except Exception: pass
        c.setFont("Helvetica", 8); c.setFillColor(colors.HexColor("#444444"))
        c.drawRightString(w-12*mm, h-12*mm, f"{self.rtitle} | Anarock CLA Online Listing Platform | {DATE}")
        c.setStrokeColor(LINE); c.line(12*mm, h-18*mm, w-12*mm, h-18*mm)
        c.drawString(12*mm, 8*mm, f"FusionHawk | Prepared for Anarock Property Consultants Pvt. Ltd. | repo fusionhawk/Anarock main @ {COMMIT} | confidential")
        c.drawRightString(w-12*mm, 8*mm, f"Page {d.page}")
        c.restoreState()

def cover(title, subtitle):
    return [P(E(title), TITLE), P(E(subtitle), SUB), Spacer(1, 4)]

# ------------------------------------------------------------------ evidence parsing
def read(name):
    p = os.path.join(EV, name)
    return open(p, errors="ignore").read() if os.path.exists(p) else ""

def parse_results(text):
    rows = []
    for l in text.splitlines():
        m = re.match(r"^(PASS|FAIL)\s+(\S+)\s+(.*)$", l)
        if m:
            desc = m.group(3); actual = ""
            if "  expected=" in desc or " expected=" in desc:
                desc, _, actual = desc.partition(" expected=")
                actual = "expected=" + actual
            elif "  -> " in desc:
                desc, _, actual = desc.partition("  -> ")
            rows.append((m.group(1), m.group(2), desc.strip(), actual.strip()))
    return rows

api = parse_results(read("08_api_tests.log"))
br = parse_results(read("09_browser_tests.log"))
# split browser run into desktop / mobile at the 2nd "/ loads" line
idx = [i for i, r in enumerate(br) if r[1] == "PAGE" and r[2].startswith("/ loads")]
split = idx[1] if len(idx) > 1 else len(br)
for i, r in enumerate(br): br[i] = r + ("desktop 1366px" if i < split else "mobile 375px",)
api_p = sum(1 for r in api if r[0] == "PASS"); api_f = len(api) - api_p
br_p = sum(1 for r in br if r[0] == "PASS"); br_f = len(br) - br_p

def count_lines(path_glob):
    n = 0
    for f in glob.glob(path_glob, recursive=True):
        try: n += sum(1 for _ in open(f, errors="ignore"))
        except Exception: pass
    return n
SRC = os.path.join(ROOT, "anarock", "src")
LOC_ALL = count_lines(SRC + "/**/*.js") + count_lines(SRC + "/**/*.jsx")
LOC_APP = LOC_ALL - count_lines(SRC + "/components/ui/*.jsx")

# ------------------------------------------------------------------ CVSS 3.1
def cvss(vec):
    m = dict(x.split(":") for x in vec.split("/"))
    AV = {"N": .85, "A": .62, "L": .55, "P": .2}[m["AV"]]; AC = {"L": .77, "H": .44}[m["AC"]]
    ch = m["S"] == "C"
    PR = {"N": .85, "L": (.68 if ch else .62), "H": (.5 if ch else .27)}[m["PR"]]; UI = {"N": .85, "R": .62}[m["UI"]]
    cia = {"H": .56, "L": .22, "N": 0}
    iss = 1 - (1 - cia[m["C"]]) * (1 - cia[m["I"]]) * (1 - cia[m["A"]])
    imp = 7.52 * (iss - .029) - 3.25 * (iss - .02) ** 15 if ch else 6.42 * iss
    ex = 8.22 * AV * AC * PR * UI
    if imp <= 0: return 0.0
    v = min(1.08 * (imp + ex), 10) if ch else min(imp + ex, 10)
    return math.ceil(v * 10 - 1e-9) / 10
def sev(score):
    return "Critical" if score >= 9 else "High" if score >= 7 else "Medium" if score >= 4 else "Low" if score > 0 else "Info"

# ------------------------------------------------------------------ FINDINGS (all verified in this run; "How verified" states the method)
# id, title/description, vector, OWASP2021, API2023, ASVS, CWE, how verified, recommendation
F = [
 ("S-01", "Next.js 14.2.35 (and the eslint-config-next / tailwindcss chains) carry known advisories: npm audit = 13 (1 critical, 10 high, 2 moderate). Advisories include image-optimizer DoS/RCE, request smuggling in rewrites, cache confusion and server-function disclosure. package-lock.json is out of sync with package.json, so npm ci fails and builds are not reproducible.",
  "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", "A06:2021 Vulnerable and Outdated Components", "API8:2023 Security Misconfiguration", "V14.2.1", "CWE-1104, CWE-937",
  "Executed: npm audit (02_npm_ci_audit.log); npm ci (fails: lock missing @emnapi/core, @emnapi/runtime 1.11.3). Score reflects the worst advisory; exploitability in this deployment (which advisory features are used) was not tested.",
  "Upgrade Next.js to a patched release, regenerate and commit the lockfile, run npm audit in CI."),
 ("S-02", "/api/lead2 (home-page 'post a requirement' form) has no rate limit, no content-type or body-size check, no honeypot and no phone/email format validation, and writes client-supplied leadSource, leadStatus and subLeadSource straight into CRM Lead_Source, Lead_Status and Sublead_Source (CRM picklists include 'Listing Platform', 'Qualified', 'Junk Lead'). Lead creation triggers CRM workflows.",
  "AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N", "A04:2021 Insecure Design; A03:2021 Injection (unvalidated input)", "API6:2023 Unrestricted Access to Sensitive Business Flows; API3:2023 BOPLA", "V5.1.3, V11.1.4, V13.2.1", "CWE-20, CWE-915, CWE-770",
  "Runtime: invalid phone/email, text/plain and 60KB bodies all reached the CRM-token step (HTTP 500, not 400/415/413); 15 consecutive POSTs never returned 429 (08_api_tests.log). Code: lead2/route.js (field pass-through). CRM picklists read live (10_crm_inspection.log).",
  "Reuse the validation of /api/leads; whitelist source/status server-side; add CAPTCHA and gateway throttling."),
 ("S-03", "Rate limiting on /api/leads and /api/lead3 keys on the client-supplied X-Forwarded-For header and stores counters in a per-instance in-memory Map that is never purged. Rotating the header bypasses the 10 req/min limit entirely, and the Map grows without bound.",
  "AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:L", "A04:2021 Insecure Design", "API4:2023 Unrestricted Resource Consumption", "V11.1.4, V13.4.1", "CWE-348, CWE-770",
  "Runtime: same client blocked on request 11 (429); 12 requests with a different X-Forwarded-For each returned 400, never 429 (both endpoints). Code: leads/route.js:121-160.",
  "Use the platform-trusted client IP, a shared store, and API Gateway throttling (required by SoW 3.2)."),
 ("S-04", "Duplicate-lead handling lets an anonymous caller overwrite fields of an existing CRM lead (PUT /crm/v8/Leads/{id} with attacker-supplied values, workflows triggered), and the response reveals whether the phone/email already exists plus the CRM lead ID and owner team. Same pattern in lead3.",
  "AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:H/A:N", "A01:2021 Broken Access Control", "API1:2023 BOLA; API3:2023 BOPLA", "V4.2.1, V8.3.4", "CWE-639, CWE-285, CWE-200",
  "Code read: leads/route.js duplicate handling (about lines 498-540 and the PUT path) and response fields. Not executed end-to-end: needs a CRM sandbox (no production writes were made).",
  "Never update an existing lead from public input: create a note/task instead; return a generic response without IDs."),
 ("S-07", "The public property API returns the entire Data Store row: propertyMapper spreads ...row into the response with no field whitelist. The production Properties table has columns SPOCName, SPOCNumber (non-empty in 152 of 395 rows), AchievableRent (non-empty in 151), QuotedRent, crmID and CREATORID, so internal contact numbers and internal pricing are served to anonymous users. When no page params are sent the whole catalogue is returned in one response.",
  "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N", "A01:2021 Broken Access Control; A04:2021 Insecure Design", "API3:2023 Broken Object Property Level Authorization", "V8.3.4, V13.2.2", "CWE-213, CWE-359, CWE-200",
  "Code: propertyMapper.js:23-27 (...row) and properties/[id]/route.js returns the mapped row; no SPOC* stripping anywhere (grep). Catalyst Data Store read via connector: column list and COUNT queries (10b_catalyst_inspection.log). Runtime response NOT demonstrated: needs Catalyst credentials.",
  "Whitelist public fields in a DTO; drop SPOC*, AchievableRent, crmID, CREATORID; cap pageSize."),
 ("S-05", "Public API responses expose internal error text, including environment-variable names (CATALYST_PROJECT_ID is missing, ZOHO_CLIENT_ID is missing), and the same text is rendered to users on /properties, /kyc and property pages. Fallback JSON.stringify(error) can serialise arbitrary SDK errors.",
  "AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N", "A05:2021 Security Misconfiguration", "API8:2023 Security Misconfiguration", "V7.4.1", "CWE-209",
  "Runtime (no credentials): GET /api/properties, /api/properties/1, /api/kyc, /api/cities, /api/micromarkets return env-var names; browser tests show the text on 3 pages (08, 09 logs). Code: properties/[id]/route.js catch block.",
  "Return generic messages; log details server-side only."),
 ("S-15", "Public lead endpoints can be driven from any website: /api/lead2 accepts a cross-origin text/plain POST (no CORS preflight needed), so any third-party page can make visitors' browsers submit leads. The 50KB body limit in /api/leads and /api/lead3 relies on Content-Length and is skipped by chunked requests.",
  "AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N", "A01:2021 Broken Access Control; A04:2021 Insecure Design", "API4:2023 Unrestricted Resource Consumption", "V13.2.3, V4.2.2", "CWE-352, CWE-770",
  "Runtime: cross-origin text/plain POST to /api/lead2 processed (500 at CRM stage, not 415); 60KB chunked POST to /api/leads parsed and rejected 400 instead of 413 (08_api_tests.log).",
  "Enforce Origin checks, JSON-only content type and a streaming body-size limit."),
 ("S-17", "Catalyst platform configuration (read-only via connector): project authentication has public sign-up enabled (hosted auth) although the site has no end-user accounts; the default role 'App User' holds SELECT/UPDATE/INSERT on the Properties table; the Stratus bucket property-images has encryption and audit logging off; CORS list in Production contains 127.0.0.1 and crm.zoho.in; the only API Gateway rule (stratus_upload, method ANY) points at a function that is not deployed. Potential for anonymous sign-ups to obtain table write permission through Catalyst client APIs was NOT tested (no writes allowed).",
  "AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:N", "A05:2021 Security Misconfiguration; A01:2021 Broken Access Control", "API8:2023 Security Misconfiguration", "V14.1.1, V4.1.3", "CWE-1188, CWE-276, CWE-732",
  "Connector reads: Get_Authentication_Configurations, Get_Table_Permissions, Get_All_Buckets, List_All_CORS_Domains, List_All_API_route (10b_catalyst_inspection.log). Exploitation not tested.",
  "Disable public sign-up; give App User SELECT only; enable bucket encryption; remove localhost CORS from Production; review the gateway rule."),
 ("S-06", "No security headers: no CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy; X-Powered-By is exposed; no Origin/CSRF check on POST routes. OWASP ZAP passive scan independently reports CSP not set (32 URLs), missing anti-clickjacking (16), X-Powered-By leak (32) and X-Content-Type-Options missing (123).",
  "AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N", "A05:2021 Security Misconfiguration", "API8:2023 Security Misconfiguration", "V14.4.1-V14.4.7, V14.5.3", "CWE-693, CWE-1021, CWE-497",
  "Executed: curl -I on / (7 header checks fail) and ZAP 2.16.1 passive scan (06c_zap_baseline.log). next.config.mjs has no headers(). Scan was against the dev server; TLS/HSTS cannot be judged on http://localhost.",
  "Add headers() in next.config, set poweredByHeader:false, add Origin checks on POST."),
 ("S-08", "The public layer does not enforce 'Published/approved'. Every Data Store row is served (propertiesCache maps all rows, no status filter). Production Data Store holds 395 Properties rows while CRM has 393 with Push_to_Website=true, and the Data Store table has no publish/status column. The sync that should enforce validation is not in the repository and no Catalyst function or cron is deployed.",
  "AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N", "A04:2021 Insecure Design", "API6:2023 Unrestricted Access to Sensitive Business Flows", "V1.4.1, V11.1.1", "CWE-841",
  "Code: propertiesCache.js:118; Data Store columns and COUNT (395) vs CRM COUNT (393) via connectors (10, 10b logs).",
  "Add an explicit published flag in the Data Store, check it in the app and in the sync function."),
 ("S-09", "Property detail page title and metadata are built from the URL slug, so any text can be injected into a page title that is served HTTP 200 and is indexable (content spoofing / SEO poisoning); unknown IDs are not 404. ZAP also flagged a user-controllable HTML attribute (requirementArea) on the home form.",
  "AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N", "A04:2021 Insecure Design", "n/a", "V5.1.1, V5.3.3", "CWE-20, CWE-451",
  "Runtime: /properties/abc/xyz -> HTTP 200 (08_api_tests.log); HTML in slug is escaped in <title> (XSS test passes). Code: properties/[id]/[name]/page.js generateMetadata.",
  "Fetch the property server-side, derive the title from data, return notFound() when missing, redirect to the canonical slug."),
 ("S-10", "Long-lived Zoho OAuth refresh tokens (CRM and Catalyst) are held in app environment and used for every server call; scope and rotation are not documented. The code defaults to the Catalyst 'Production' environment and a hard-coded Properties table ID when env vars are absent, while .catalystrc contains only a Development environment. The Production Slate app has no environment variables configured.",
  "AV:N/AC:H/PR:H/UI:N/S:U/C:H/I:H/A:N", "A05:2021 Security Misconfiguration; A07:2021 Identification and Authentication Failures", "API2:2023 Broken Authentication; API8:2023", "V2.10.1, V6.4.1, V14.1.3", "CWE-1188, CWE-522",
  "Code: catalyst.js:331-332 and :412 (defaults), zoho.js; .catalystrc; Slate env-variable list for the Production deployment is empty (connector).",
  "Least-privilege scopes, separate dev/prod credentials, fail closed when env is missing, document rotation."),
 ("S-14", "Repository hygiene: GitHub Advanced Security (secret scanning / push protection) is not enabled on fusionhawk/Anarock; .gitignore files only ignore '.env*.local' (root) and '.env.local' (anarock/), so a plain .env or .env.production would be committed; git history contains 4,118 node_modules files and 787 .build/ function-bundle files from earlier commits (repository bloat, and secrets could hide in that volume). No secrets were found today.",
  "AV:N/AC:H/PR:L/UI:N/S:U/C:L/I:L/A:N", "A05:2021 Security Misconfiguration; A08:2021 Software and Data Integrity Failures", "API8:2023", "V10.3.2, V14.1.2", "CWE-540, CWE-1188",
  "Executed: GitHub run_secret_scanning call returned 'Repository does not have GitHub Advanced Security enabled' (07); history scan of 54 commits / 711,474 added lines: 0 real hits (4 false positives, header-name constants) (05); git log --diff-filter=A listing of node_modules and .build.",
  "Enable secret scanning and push protection; ignore .env and .env.*; add a pre-commit scanner; purge build artefacts from history if the repository is to be shared."),
 ("S-11", "/api/location: the Nominatim 1 req/s throttle is not serialised (concurrent requests read the same timestamp), the in-memory cache is unbounded, precise user coordinates are sent to a third party without a consent notice, malformed JSON returns 500, and failures return HTTP 200.",
  "AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L", "A04:2021 Insecure Design", "API4:2023 Unrestricted Resource Consumption", "V8.3.1, V11.1.4", "CWE-362, CWE-400, CWE-359",
  "Runtime: malformed JSON body -> 500 (08_api_tests.log). Code: location/route.js:20-30.",
  "Serialise with a lock, bound the cache, add a consent notice (DPDP), return 4xx for bad input."),
 ("S-12", "Catalyst Web SDK 4.6.2 is loaded from static.zohocdn.com on every page without Subresource Integrity, and no use of the SDK was found in client code.",
  "AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N", "A08:2021 Software and Data Integrity Failures", "API8:2023", "V14.2.3", "CWE-829, CWE-353",
  "Code: layout.js:79; grep for Catalyst client usage found none outside server libs.",
  "Remove if unused, otherwise add SRI and restrict via CSP."),
 ("S-18", "The lead forms have no method/action fallback: when ZAP's spider submitted the home form without JavaScript the browser used GET and put email, company and requirement text into the URL query string (ZAP 'Sensitive Information in URL'), which is logged by proxies and kept in history/referrers.",
  "AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N", "A04:2021 Insecure Design", "n/a", "V8.3.1", "CWE-598",
  "Executed: ZAP passive alert 10024 (06c_zap_baseline.log) with evidence of an email address in the URL; form markup in HomePage.js:2025 / HeroSection.js:1610.",
  "Add method=\"post\" and a safe action, or prevent native submit."),
 ("S-13", "Raw user search 'prompt' text is written to server logs; verbose console.log/console.error output (193 statements in 27 files) including full error objects and stacks.",
  "AV:L/AC:L/PR:H/UI:N/S:U/C:L/I:N/A:N", "A09:2021 Security Logging and Monitoring Failures", "API8:2023", "V7.1.1, V7.1.2", "CWE-532",
  "Code: properties/route.js:587-592; grep console.* counts (193 / 27 files).",
  "Remove or redact; use structured logging with levels."),
]
FIND = []
for f in F:
    sc = cvss(f[2]); FIND.append(dict(id=f[0], text=f[1], vec=f[2], score=sc, sev=sev(sc), a=f[3], api=f[4], asvs=f[5], cwe=f[6], how=f[7], fix=f[8]))
FIND.append(dict(id="S-16", text="Positive controls verified: honeypot returns a fake success to bots; /api/leads and /api/lead3 enforce 415 on wrong content-type, length limits, phone and email validation and 429 after 10 requests/min per (header-derived) client; no secrets in the working tree or in 54 commits of history (.catalystrc holds IDs only); breadcrumb JSON-LD is escaped; wishlist is client-side only; target=_blank links carry rel=noopener; cookies are not set before consent; Semgrep reports 0 findings.",
                 vec="-", score=0.0, sev="Info", a="n/a", api="n/a", asvs="V5.1.3, V8.3.1", cwe="-", how="Runtime tests, secret scan (05), Semgrep (06), browser tests (09).", fix="Keep and reuse across all endpoints."))
order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3, "Info": 4}
FIND.sort(key=lambda x: (order[x["sev"]], -x["score"]))
cnt = {s: sum(1 for f in FIND if f["sev"] == s) for s in order}
NF = len(FIND)

W = landscape(A4)[0] - 24*mm

# ================================================================== 1. SECURITY
def build_security():
    d = Doc(os.path.join(OUT, f"Anarock_Security_Report_{DATE}.pdf"), "Security Assessment Report")
    s = cover("Security Assessment Report", f"Prepared by FusionHawk for Anarock Property Consultants Pvt. Ltd. | Date: {DATE} | Repository fusionhawk/Anarock, main @ {COMMIT} | Standards: OWASP Top 10 2021, OWASP API Security Top 10 2023, OWASP ASVS 4.0 Level 2 | Severity from CVSS v3.1 base score")
    s += [P("1. Executive summary", H1)]
    s += [P(f"<b>Overall risk: High.</b> {NF} items: {cnt['Critical']} critical, {cnt['High']} high, {cnt['Medium']} medium, {cnt['Low']} low, {cnt['Info']} informational. "
            "The most important issues: (1) Next.js 14.2.35 with a critical advisory and a lockfile that cannot be installed with npm ci; (2) the public property API returns every Data Store column, which in production includes SPOC contact numbers (152 rows) and achievable rent (151 rows); "
            "(3) /api/lead2 is unauthenticated, unvalidated and writes client-chosen values into production CRM; (4) duplicate-lead handling lets the public overwrite existing CRM leads; (5) the rate limiter is bypassed by spoofing X-Forwarded-For; (6) no security headers. "
            "New this run: Catalyst platform configuration review (public sign-up enabled, default App User role can write to tables, unencrypted bucket) and the first OWASP ZAP passive scan, which independently confirms the missing headers.")]
    s += [P("Every finding below states how it was verified (executed test, scan, connector query or code read). Items that need Catalyst or Zoho credentials, a CRM sandbox or production writes were not exercised and are marked as such.")]
    s += [P("2. Activities performed this run (raw logs in reports/evidence/)", H2)]
    acts = [["#", "Activity", "Result", "Evidence"],
     ["1", "Clean sandbox and fresh clone of fusionhawk/Anarock main", f"Done; HEAD {COMMIT} (app code unchanged since b504988, 2026-10-08)", "00_clean.log, 01_git_clone.log"],
     ["2", "Scope document read from the repository and compared with code", "Done (see Scope Completeness report)", "11_scope_doc_comparison.log"],
     ["3", "Zoho CRM inspected read-only via the AnarockCRM connector", "Org, modules, Leads and Properties field metadata, record counts, COQL reads. No writes.", "10_crm_inspection.log"],
     ["4", "Catalyst inspected read-only via the anarock CLA Catalyst connector", "Functions, Data Store tables/columns/counts, Stratus, Slate, API Gateway, CORS, auth, env-variable names (none set). No writes.", "10b_catalyst_inspection.log"],
     ["5", "npm ci / npm audit", "npm ci FAILS (lock out of sync); npm audit 13 vulnerabilities (1 critical, 10 high, 2 moderate)", "02_npm_ci_audit.log"],
     ["6", "Semgrep 1.181.0 (p/javascript, p/nextjs, p/owasp-top-ten, p/secrets)", "Project: 0 findings, 0 errors, 105 files. Scanner proven on known-bad sample: 3 findings", "06_sast_semgrep.log"],
     ["7", "Secret scan of working tree and full git history", "149 text files and 711,474 added lines in 54 commits: 0 real hits (4 false positives); regex scanner proven on a known-bad sample", "05_secret_scan.log"],
     ["8", "GitHub secret scanning", "NOT possible: 'Repository does not have GitHub Advanced Security enabled'", "07_github_secret_scanning.log"],
     ["9", "OWASP ZAP 2.16.1 spider + passive scan vs local app", "Installed and run (java 21). 4 medium/low alert types, 4 informational. Active scan deliberately not run", "06b_zap_attempt.log, 06c_zap_baseline.log"],
     ["10", "Scripted request tests (headers, validation, rate-limit bypass, error leakage, CORS, body size)", f"{len(api)} checks: {api_p} pass / {api_f} fail", "08_api_tests.log, run_api_tests.sh"],
     ["11", "Browser tests (Playwright 1.56.1 + axe-core 4.10.2) at 1366px and 375px", f"{len(br)} checks: {br_p} pass / {br_f} fail", "09_browser_tests.log, run_browser_tests.js"],
     ["12", "Manual review of active API and lib code", f"About {LOC_APP:,} lines of application code (excluding generated UI components) read; commented-out code excluded from findings", "build_reports.py findings table"]]
    s += [table(acts, [8*mm, 70*mm, 120*mm, W-198*mm])]
    s += [P("The app ran locally with no Zoho or Catalyst credentials, so no request could reach production CRM or Data Store. All CRM and Catalyst access was through read-only connector calls.", B)]
    s += [PageBreak(), P("3. Findings", H1)]
    s += [P("Severity bands (CVSS v3.1): Critical 9.0-10, High 7.0-8.9, Medium 4.0-6.9, Low 0.1-3.9. IDs are kept stable across runs. Severity is now assigned strictly from the CVSS base score; S-03 (6.5) and S-14 (4.2) are therefore Medium where earlier runs said High and Medium by judgement.")]
    rows = [["ID", "Severity", "Finding", "Category (OWASP 2021 / API 2023 / ASVS L2)", "CWE", "CVSS 3.1", "How verified", "Recommendation"]]
    for f in FIND:
        rows.append([f["id"], col(f["sev"]), E(f["text"]), f'{E(f["a"])}<br/><b>API:</b> {E(f["api"])}<br/><b>ASVS:</b> {E(f["asvs"])}', E(f["cwe"]),
                     (f'<b>{f["score"]}</b><br/>{E(f["vec"])}' if f["score"] else "-"), E(f["how"]), E(f["fix"])])
    s += [table(rows, [10*mm, 15*mm, 75*mm, 45*mm, 17*mm, 26*mm, 52*mm, W-240*mm])]
    s += [PageBreak(), P("4. Controls tested and not tested", H1)]
    ctl = [["Control / area", "Status", "Detail"],
     ["Dependency vulnerabilities (A06)", "Tested - FAIL", "npm audit 13; lockfile unusable with npm ci"],
     ["SAST (Semgrep OWASP packs)", "Tested - pass", "0 findings in 105 files; canary proves rules fire. Pattern tools do not find logic flaws such as S-02/S-04"],
     ["Secrets in tree and history", "Tested - pass", "0 real hits; 4 header-name false positives; GitHub secret scanning unavailable (S-14)"],
     ["Security headers (CSP, HSTS, XFO, XCTO, Referrer, Permissions)", "Tested - FAIL", "All six absent; X-Powered-By present (curl + ZAP). HSTS only meaningful over TLS: not verifiable on http://localhost"],
     ["Input validation on lead endpoints", "Tested - mixed", "/api/leads and /api/lead3 validate; /api/lead2 does not; malformed JSON gives 500 on /api/leads"],
     ["Rate limiting and bypass", "Tested - FAIL", "Limit exists on 2 of 3 lead endpoints and is bypassable via X-Forwarded-For"],
     ["Body-size limits", "Tested - FAIL", "Content-Length enforced (413); chunked bodies not (400); lead2 has none"],
     ["CORS", "Tested - pass", "No wildcard or reflected Access-Control-Allow-Origin on /api/properties or OPTIONS /api/leads (but see S-15: simple POSTs need no preflight)"],
     ["Error leakage", "Tested - FAIL", "Env-var names exposed by 5 API routes and rendered on 3 pages"],
     ["XSS (reflected, title, JSON-LD)", "Tested - pass", "HTML in slug escaped; JSON-LD escaped; ZAP reports one user-controllable attribute (informational)"],
     ["Passive DAST (OWASP ZAP)", "Tested", "Spider found 251 URLs; alerts in 06c_zap_baseline.log"],
     ["Active DAST / fuzzing", "NOT run", "Excluded by design: active scanning of the lead endpoints would generate junk requests against code that reaches the CRM-token step; no isolated CRM sandbox exists"],
     ["Authentication / session management", "N/A", "Site has no end-user login; wishlist session ID is client-side. Catalyst sign-up is open (S-17)"],
     ["Authorization of CRM/Data Store access", "Partly tested", "Connector view of roles and table permissions (S-17); runtime exploitation not tested"],
     ["Duplicate-lead overwrite, lead creation end-to-end", "NOT tested", "Needs CRM sandbox; production writes forbidden"],
     ["Data Store/Stratus responses, image ACLs", "NOT tested", "No Catalyst credentials for the app; bucket public/protected type not returned by the API"],
     ["TLS configuration, HSTS preload, certificates", "NOT tested", "Local http only; no Production Slate deployment exists (failed)"],
     ["Load / DoS testing", "NOT done", "Out of agreed method; in-memory limits noted as design risk"],
     ["Infrastructure / WAF / monitoring", "No evidence", "No logging, alerting or monitoring configuration exists in repo or Catalyst (no cron, no job pools)"],
     ["Third-party penetration test", "NOT done", "This is an automated weekly assessment, not a pen test"]]
    s += [table(ctl, [75*mm, 28*mm, W-103*mm])]
    s += [P("5. Standards coverage", H1)]
    top = [["OWASP Top 10 2021", "Result", "Findings"],
     ["A01 Broken Access Control", "Fail", "S-04, S-07, S-15, S-17"], ["A02 Cryptographic Failures", "Not assessed in depth", "Stratus bucket unencrypted (S-17); TLS not verifiable"],
     ["A03 Injection", "No injection-class issue found", "Semgrep 0; unvalidated lead2 input (S-02)"], ["A04 Insecure Design", "Fail", "S-02, S-03, S-08, S-09, S-11, S-18"],
     ["A05 Security Misconfiguration", "Fail", "S-05, S-06, S-10, S-14, S-17"], ["A06 Vulnerable and Outdated Components", "Fail", "S-01"],
     ["A07 Identification and Authentication Failures", "Partly", "S-10 (tokens); no user auth to test"], ["A08 Software and Data Integrity Failures", "Fail", "S-12, S-14"],
     ["A09 Logging and Monitoring Failures", "Fail", "S-13; no monitoring exists"], ["A10 Server-Side Request Forgery", "Not found", "Server fetches only fixed hosts (Zoho, Nominatim, Frankfurter); code read"]]
    s += [table(top, [90*mm, 60*mm, W-150*mm])]
    s += [Spacer(1, 4)]
    apit = [["OWASP API Top 10 2023", "Result", "Findings"],
     ["API1 BOLA", "Fail (code)", "S-04"], ["API2 Broken Authentication", "n/a (no user API); token handling", "S-10"], ["API3 Broken Object Property Level Authorization", "Fail", "S-02, S-04, S-07"],
     ["API4 Unrestricted Resource Consumption", "Fail", "S-03, S-11, S-15"], ["API5 Broken Function Level Authorization", "Not found", "No admin functions exposed; Catalyst roles in S-17"],
     ["API6 Unrestricted Access to Sensitive Business Flows", "Fail", "S-02, S-08"], ["API7 SSRF", "Not found", "see A10"],
     ["API8 Security Misconfiguration", "Fail", "S-01, S-05, S-06, S-17"], ["API9 Improper Inventory Management", "Fail", "Two Development Slate apps and one failed Production app serve the same code; stray /HomePage route; undeployed stratus_upload with a live gateway rule"],
     ["API10 Unsafe Consumption of APIs", "Partly", "Frankfurter/Nominatim responses used without schema validation (code read)"]]
    s += [table(apit, [90*mm, 60*mm, W-150*mm])]
    s += [Spacer(1, 4)]
    asvs = [["ASVS 4.0 chapter (L2)", "Result", "Basis"],
     ["V1 Architecture", "Partial", "No threat model; no published-only enforcement (S-08)"], ["V2 Authentication", "N/A", "No end-user authentication"], ["V3 Session management", "N/A", "No server sessions"],
     ["V4 Access control", "Fail", "S-04, S-07, S-17"], ["V5 Validation, sanitisation, encoding", "Partial", "S-02, S-09; output encoding sound"], ["V6 Stored cryptography", "Not verifiable", "Stratus encryption off; Data Store encryption not queryable"],
     ["V7 Error handling and logging", "Fail", "S-05, S-13"], ["V8 Data protection", "Fail", "S-07, S-18"], ["V9 Communications", "Not verifiable", "No TLS endpoint available (Production deployment failed)"],
     ["V10 Malicious code", "Pass", "Semgrep and review found none; S-12 note"], ["V11 Business logic", "Fail", "S-02, S-03, S-08"], ["V12 Files and resources", "N/A", "No upload in the app (stratus_upload function not deployed)"],
     ["V13 API and web service", "Fail", "S-02, S-15"], ["V14 Configuration", "Fail", "S-01, S-06, S-10, S-14, S-17"]]
    s += [table(asvs, [90*mm, 60*mm, W-150*mm])]
    s += [PageBreak(), P("6. Dependency audit (npm audit, executed this run)", H1)]
    dep = [["Package", "Severity", "Affected range", "Note"],
     ["next (installed 14.2.35, direct)", "critical", "9.3.4-canary.0 - 16.3.0-preview.10", "Fix needs a major upgrade (npm suggests 16.4.2)"],
     ["eslint-config-next (direct)", "high", "14.0.5-canary.0 - 15.0.0-rc.1", "Dev-time"], ["tailwindcss (direct, via chokidar/fast-glob/micromatch)", "high", "0.5.0 - 3.4.19", "Dev-time"],
     ["postcss, source-map-js, postcss-selector-parser and other transitive packages", "high / moderate", "various", "Total 13: 1 critical, 10 high, 2 moderate"]]
    s += [table(dep, [95*mm, 25*mm, 70*mm, W-190*mm])]
    s += [P("7. OWASP ZAP passive scan results (spider + passive, local dev server)", H1)]
    z = [["Alert", "Risk", "CWE", "Instances"],
     ["Content Security Policy (CSP) Header Not Set", "Medium", "693", "32"], ["Missing Anti-clickjacking Header", "Medium", "1021", "16"],
     ["Server leaks information via X-Powered-By", "Low", "497", "32"], ["X-Content-Type-Options header missing", "Low", "693", "123"],
     ["Content-Type header missing (API root)", "Info", "345", "1"], ["Sensitive information in URL (form submitted by GET)", "Info", "598", "1"],
     ["Suspicious comments (dev bundle)", "Info", "615", "73"], ["User-controllable HTML element attribute", "Info", "20", "1"]]
    z = [z[0]] + [[r[0], col(r[1] if r[1] != "Info" else "Info"), r[2], r[3]] for r in z[1:]]
    s += [table(z, [120*mm, 25*mm, 20*mm, W-165*mm])]
    s += [P("ZAP also logged an XML parse error on sitemap.xml (unescaped '&' in /services&tools); that is a code-review item. Findings from a development server (next dev) can differ from a production build; header findings apply to both because next.config has no headers().")]
    s += [P("8. Limitations and technical blocks", H1)]
    for t in ["No Zoho or Catalyst credentials and no CRM sandbox were available to the app: Data Store, Stratus and CRM-write flows (listing results, detail data, lead creation end to end, duplicate-lead behaviour, KYC and market-stats data) could not be executed and are marked Blocked or Not verifiable. Findings S-04, S-07 and S-08 rest on code plus read-only connector evidence, not on a captured production response.",
              "Connectors used: AnarockCRM and anarock CLA Catalyst, both enabled and working this run (read-only calls only). Catalyst function source code and Stratus object listings are not retrievable through the connector; build logs for the failed Production Slate deployment returned no data.",
              "GitHub secret scanning needs GitHub Advanced Security, which is not enabled (S-14). ZAP active scan, load testing and TLS testing were not performed (see section 4).",
              "SAST found no injection-class issues, but the main findings are logic and design flaws that pattern-based tools do not detect. No application code was modified; the only repository changes are README.md and reports/."]:
        s.append(P("- " + E(t)))
    s += [P("9. Priority remediation", H1), P("1) Upgrade Next.js, fix the lockfile, add npm audit to CI. 2) Whitelist public property fields (S-07) and enforce a published flag (S-08). 3) Lock down /api/lead2 and the duplicate-update path (S-02, S-04); move throttling to a trusted layer with CAPTCHA (S-03, S-15). 4) Stop leaking errors and add security headers (S-05, S-06). 5) Tighten Catalyst configuration: disable public sign-up, reduce App User permissions, encrypt the bucket (S-17). 6) Review OAuth scopes and environment defaults (S-10); enable GitHub secret scanning (S-14).")]
    d.build(s)

# ================================================================== 2. CODE REVIEW
def build_code():
    d = Doc(os.path.join(OUT, f"Anarock_Code_Review_{DATE}.pdf"), "Code Review Report")
    s = cover("Code Review Report", f"Prepared by FusionHawk for Anarock Property Consultants Pvt. Ltd. | Date: {DATE} | Repository fusionhawk/Anarock, main @ {COMMIT} | Basis: OWASP Code Review Guide, ISO/IEC 25010, CWE | Build, lint and install run in a clean sandbox this run")
    s += [P("1. Executive summary", H1)]
    s += [P("<b>The code does not build and the Production Slate deployment has failed.</b> next lint reports one error (list-your-property/page.js:993) that stops next build; npm ci cannot install because package-lock.json is out of sync; the Catalyst Production Slate deployment of 2026-10-14 failed after 13 minutes (the build log is not retrievable through the connector, so the lint failure is a plausible, unconfirmed cause). "
            f"The application is about {LOC_APP:,} lines (excluding {LOC_ALL-LOC_APP:,} lines of generated shadcn/ui components) with no automated tests, no CI, and large amounts of dead code. Core lead capture works in the live CRM (7 'Listing Platform' leads since 2026-09-22), but listing and detail pages are client-rendered, so the SEO scope is not met.")]
    s += [P("2. Build, install and lint results (executed in the clean sandbox)", H1)]
    bl = [["Check", "Result", "Detail", "Evidence"],
     ["npm ci (Node 22.22.0, npm 10.9.4)", col("FAIL") , "EUSAGE: lock file out of sync; Missing @emnapi/core@1.11.3 and @emnapi/runtime@1.11.3", "02_npm_ci_audit.log"],
     ["npm install (workaround, scratch copy)", col("PASS"), "395 packages installed in 14 s; deprecation warnings for eslint 8.57.0, glob 7/10", "03_lint_build.log"],
     ["next lint", col("FAIL"), "1 error: react/no-unescaped-entities at src/app/list-your-property/page.js:993:56; 4 warnings (3 x &lt;img&gt; instead of next/image: Footer.js:70, Navbar.js:711, HomePage.js:1379; 1 missing hook dependency Navbar.js:326)", "03_lint_build.log"],
     ["next build", col("FAIL"), "Compiled successfully, then 'Failed to compile' at the lint gate (same error). No production bundle can be produced", "03_lint_build.log"],
     ["npm audit", col("FAIL"), "13 vulnerabilities (1 critical, 10 high, 2 moderate)", "02_npm_ci_audit.log"],
     ["Type checking", "Not available", "Project is JavaScript (jsconfig.json only); no TypeScript or typecheck script", "-"],
     ["Unit / integration tests", "Not available", "No test files, no test script, no test framework in package.json", "git ls-files"]]
    s += [table(bl, [50*mm, 17*mm, W-50*mm-17*mm-45*mm, 45*mm])]
    s += [P("3. Codebase metrics (measured this run)", H1)]
    met = [["Metric", "Value", "Comment"],
     ["Application source (src, js/jsx)", f"{LOC_ALL:,} lines", f"{LOC_APP:,} excluding src/components/ui (generated shadcn components)"],
     ["Largest files", "properties/route.js 2,341; lead3/route.js 1,476; leads/route.js 1,044; HomePage.js 2,365; catalyst.js 787", "Several files carry the logic of whole modules; hard to review or test"],
     ["Commented-out code", "properties/route.js: 1,221 of 2,341 lines (52%); catalyst.js: 273 of 787 lines", "Dead code (CWE-561) hides the real implementation and old credentials flow; git already holds history"],
     ["Lead endpoints", "3 (leads 1,044 lines, lead2 512, lead3 1,476)", "Overlapping responsibilities; different validation per endpoint (see S-02)"],
     ["console.* statements", "193 in 27 files", "Includes raw error objects and user search text (S-13)"],
     ["Empty files", "src/lib/propertyService.js (0 lines)", "Dead module"],
     ["Direct dependencies", "next 14.2.35, react 18, framer-motion, radix-ui, zcatalyst-sdk-node, tailwind 3, eslint 8", "Next 14 line has critical advisories (S-01)"]]
    s += [table(met, [45*mm, 100*mm, W-145*mm])]
    s += [PageBreak(), P("4. Findings register", H1)]
    C = [
     ("C-01", "High", "Build gate broken", "next build fails on a lint error (list-your-property/page.js:993: unescaped apostrophe). Combined with the failed Production Slate deployment (Catalyst deployment 16250000000011003, build 16250000000011007 Failed after 13m8s on 2026-10-14) there is no working Production site.", "CWE-710; ISO 25010 Reliability/Portability", "Executed next build (03_lint_build.log); Slate status via connector", "Fix the entity, re-run build in CI, redeploy Production; investigate the Slate build log."),
     ("C-02", "High", "Non-reproducible installs", "package-lock.json is out of sync with package.json; npm ci fails. Slate's install_command is `npm install`, so every deployment resolves new versions.", "CWE-1104; ISO Maintainability", "Executed npm ci", "Regenerate and commit the lockfile; use npm ci in Slate and CI."),
     ("C-03", "Medium", "Listing and detail pages are client-rendered (SEO scope not met)", "/properties page.js renders <Suspense> with 'Loading properties...' and a client component; the server HTML contains no listings. Home page is `use client` and imports a 2,365-line component from src/pages/HomePage.js. SoW 3.3 requires SSR/SSG/ISR of listing and detail pages.", "ISO Functional suitability; SoW 3.3", "Executed: server HTML check in run_api_tests.sh (FAIL); code read", "Fetch listings server-side in a server component with ISR; keep only interactive filters on the client."),
     ("C-04", "Medium", "Canonical URL wrong on every page", "layout.js sets alternates.canonical = '/' globally; pages that do not override it (properties, detail, services, KYC, list-your-property) all declare the homepage as canonical. /shortlist canonicalises to /wishlist, which returns 404.", "ISO Functional suitability; SEO", "Executed: curl of 5 pages, canonical = http://localhost:3111 (08 log)", "Set per-page canonical in generateMetadata."),
     ("C-05", "Medium", "Sitemap and robots defects", "sitemap.js lists 'services&tools' (unescaped '&' makes sitemap.xml invalid XML; ZAP logged a parse error; the URL 404s) and 'list-property' (404; real route is /list-your-property); no property or KYC URLs are listed; robots.txt disallows /wishlist, which does not exist.", "ISO Functional suitability; CWE-116", "Executed: sitemap URL resolution (2 x 404), ZAP spider error", "Generate the sitemap from real routes and Data Store rows; escape XML."),
     ("C-06", "Medium", "Legal and information pages missing", "Footer links /aboutus, /privacy-policy, /rera and /terms-of-use all return 404. SoW 5.1 requires About, Contact, Privacy Policy and Terms pages (privacy page is also needed for the cookie banner and DPDP compliance).", "ISO Functional suitability; legal", "Executed: link crawl (4 x 404)", "Add the pages or remove the links."),
     ("C-07", "Medium", "Dead code and file size", "52% of properties/route.js and 273 lines of catalyst.js are commented-out code; HomePage.js is 2,365 lines; leads/lead3 are 1,000+ line single functions.", "CWE-561, CWE-1121; ISO Maintainability (modularity, analysability)", "Measured (section 3)", "Delete dead code, split into modules, extract shared lead logic."),
     ("C-08", "Medium", "Three overlapping lead endpoints with different guards", "leads (validation, honeypot, rate limit), lead2 (none) and lead3 (as leads plus subform) each re-implement token refresh, duplicate handling and responses. The weakest one is what an attacker uses (S-02).", "CWE-1041 (redundant code); ISO Maintainability/Security", "Code read; runtime tests", "One shared handler with schema validation (e.g. zod) and one throttle."),
     ("C-09", "Medium", "In-memory state for caches and rate limits", "Rate limit, property cache, city/micromarket/KYC caches live in module-level Maps/globalThis. On serverless/multi-instance hosting each instance has its own state and memory growth is unbounded for the limiter.", "CWE-770; ISO Reliability/Performance", "Code read (leads/route.js:121, cache.js, propertiesCache.js)", "Use Catalyst Cache or the gateway for throttling; bound caches."),
     ("C-10", "Low", "Stray Pages-Router route", "src/pages/HomePage.js sits in the Pages Router directory of an App Router project, so Next serves it as a second page at /HomePage (HTTP 200) with duplicate home content.", "ISO Maintainability; SEO duplicate content", "Executed: curl /HomePage = 200", "Move the component to src/components/home/ and import it."),
     ("C-11", "Low", "Deployment hygiene", "catalyst.json points at a Windows path (D:\\Catalyst\\anarock) and registers one Slate app ('nextjs'), while Catalyst holds two Development apps (Anarock, nextjs) and a failed Production app (anarock, upload type, root ./Catalyst). Production Slate has no environment variables configured.", "ISO Portability/Maintainability", "catalyst.json; connector (10b log)", "One app per environment, built from the repository, with env vars set in Catalyst."),
     ("C-12", "Low", "Boilerplate documentation", "anarock/README.md is the unmodified create-next-app text; no .env.example, CONTRIBUTING, SECURITY, LICENSE or CODEOWNERS.", "ISO Maintainability (analysability)", "git ls-files", "Replace with project docs (root README is accurate and maintained)."),
     ("C-13", "Low", "Unvalidated third-party responses", "exchange-rates and location routes pass upstream JSON through without schema checks; location and exchange-rate failures return HTTP 200/502 inconsistently.", "CWE-20; OWASP API10", "Code read; runtime tests", "Validate with a schema and use consistent status codes."),
     ("C-14", "Low", "Fonts fetched from Google at build time", "next/font/google downloads Inter during build/dev; offline or restricted build environments fall back silently (seen in the sandbox log).", "ISO Portability/Reliability", "Dev server log", "Self-host the font."),
     ("C-15", "Low", "Seed data presented as live", "Catalyst Stats table (market stats widget) has hard-coded column defaults 850,000,000 / 145,000,000 / 98,000,000 / 42,000,000 and one row; KYC table has default quarter 'Q4 2026'. If the row is not maintained the homepage shows unsourced numbers.", "ISO Functional suitability", "Data Store column metadata via connector", "Add an owner/process for Stats and show an 'as of' date."),
    ]
    rows = [["ID", "Severity", "Title", "Detail", "Standard / CWE", "How verified", "Recommendation"]]
    for c in C: rows.append([c[0], col(c[1]), f"<b>{E(c[2])}</b>", E(c[3]), E(c[4]), E(c[5]), E(c[6])])
    s += [table(rows, [10*mm, 15*mm, 38*mm, 100*mm, 33*mm, 40*mm, W-236*mm])]
    s += [P("Security-specific findings (S-01 to S-18) are in the Security report; they are not repeated here.")]
    s += [PageBreak(), P("5. ISO/IEC 25010 quality assessment", H1)]
    iso = [["Characteristic", "Rating", "Evidence"],
     ["Functional suitability", "Partial", "Search, filters, compare, wishlist, currency/area switch, lead capture and KYC pages exist; AI search, SalesIQ, PageSense, GA4, view scoring absent; listing SSR missing (C-03); legal pages 404 (C-06)"],
     ["Performance efficiency", "Concern", "Whole catalogue (395 rows) can be returned in one response; in-memory caches; 2,365-line client component for home; 3 un-optimised <img>; page loads 1.1-2.3 s on the dev server"],
     ["Compatibility", "Good", "No horizontal scroll at 1366px and 375px on all 8 pages; no console errors in the browser tests"],
     ["Usability / accessibility", "Concern", "axe-core WCAG 2.1 A/AA: 4 of 8 pages (desktop) and 3 of 8 (375px) have critical/serious violations (section 6); users see raw internal errors when the backend is unavailable"],
     ["Reliability", "Poor", "Build fails; Production deployment failed; error handling returns 500/200 inconsistently; cache and limiter state per instance"],
     ["Security", "Poor", "See Security report: 1 critical, high and medium findings; no headers; open sign-up"],
     ["Maintainability", "Poor", "Dead code 52% of the largest route; three duplicated lead handlers; no tests, no CI, no types; stale docs in subfolder"],
     ["Portability", "Concern", "Windows path in catalyst.json; npm ci fails; Google font download at build"]]
    s += [table(iso, [40*mm, 22*mm, W-62*mm])]
    s += [P("6. Accessibility results (axe-core 4.10.2, WCAG 2.1 A and AA, Playwright 1.56.1)", H1)]
    ax = [["Viewport", "Page", "Result", "Violations (rule(impact, nodes))"]]
    for r in br:
        if r[1] == "A11Y":
            pg = r[2].split(" axe:")[0]
            ax.append([r[4], E(pg), col(r[0]), E(r[3].split(" | ")[0] if r[3] else "none critical/serious")])
    s += [table(ax, [28*mm, 60*mm, 18*mm, W-106*mm])]
    s += [P("Defects: aria-required-parent on the home page (2 nodes), select-name (unlabelled selects) on /properties and /list-your-property, and colour contrast on home, list-your-property and KYC pages. Only critical and serious impacts are gated; moderate and minor issues are listed in 09_browser_tests.log ('all:' list). Automated tools find roughly a third of WCAG issues; manual keyboard and screen-reader testing was not done.")]
    s += [PageBreak(), P("7. Register of missing items", H1)]
    M = [["Area", "Missing item", "Status", "Note"],
     ["Catalyst Functions", "CRM sync, Stratus image push, Gemini attribute generation, validation routing, view scoring, revalidation, lead capture function", "Missing", "Only stratus_upload exists in Catalyst: is_deployed=false in both environments, source not in the repo; lead capture lives in Next.js API routes"],
     ["Catalyst Search", "Full-text and faceted search service", "Missing", "No code or configuration; search is in-memory over the Data Store cache"],
     ["API Gateway", "Rules, auth and throttling in front of app APIs", "Missing", "One rule (stratus_upload, ANY); SoW 3.2 requires gateway to secure endpoints"],
     ["Scheduled jobs", "Sitemap regeneration, stale-content revalidation", "Missing", "No cron jobs or job pools in Catalyst"],
     ["Tests", "Unit, API, E2E tests; test script", "Missing", "None in repo; this assessment's scripts in reports/evidence/ are the only automated checks"],
     ["CI/CD", "GitHub Actions or Catalyst pipeline with lint, build, audit", "Missing", "No .github, no pipelines; build failures reach Slate unnoticed"],
     ["Config", ".env.example, documented env variables per environment, secrets rotation notes", "Missing", "Root README documents variables; Production Slate has none set"],
     ["Security headers / CSP / CAPTCHA", "headers(), CAPTCHA on lead forms", "Missing", "S-06, S-02"],
     ["Monitoring and alerting", "Error tracking, uptime, Catalyst log alerts", "Missing", "Application logs for the Slate app returned nothing for the last 7 days"],
     ["Analytics and engagement", "GA4/GTM, Search Console, SalesIQ, PageSense", "Missing", "No scripts or configuration in the code"],
     ["Legal / content pages", "About, Contact, Privacy Policy, Terms, RERA", "Missing", "Footer links 404 (C-06)"],
     ["Documentation", "API docs, architecture, runbook, data-flow for CRM -> Stratus -> Data Store sync", "Missing", "Sync mechanism that populates 395 Data Store rows is undocumented"],
     ["Repo governance", "LICENSE, SECURITY.md, CODEOWNERS, branch protection", "Missing", "GitHub Advanced Security off"],
     ["Structured data", "RealEstateListing / Product / Offer JSON-LD", "Missing", "Only Organization and breadcrumb JSON-LD exist"]]
    s += [table(M, [35*mm, 85*mm, 18*mm, W-138*mm])]
    s += [P("8. Limitations", H1)]
    for t in ["Review covers the active code in the repository; Catalyst Function source (stratus_upload) and any CRM-side workflows or custom functions are not visible through the connectors and were not reviewed.",
              "Runtime behaviour that needs Catalyst/Zoho credentials (listing data, detail pages, lead creation end to end) was not executed. No production writes were made. No application code was modified.",
              "Accessibility results are automated (axe-core) only."]:
        s.append(P("- " + E(t)))
    d.build(s)

# ================================================================== 3. TEST SCENARIOS
def classify(r):
    if r[0] == "PASS": return "-"
    d = r[2]
    if "sitemap contains property" in d: return "Blocked (needs Data Store)"
    return "App defect"

def build_tests():
    d = Doc(os.path.join(OUT, f"Anarock_Test_Scenarios_{DATE}.pdf"), "Test Scenarios Report")
    s = cover("Test Scenarios Report", f"Prepared by FusionHawk for Anarock Property Consultants Pvt. Ltd. | Date: {DATE} | Repository fusionhawk/Anarock, main @ {COMMIT} | Executed locally against the app started with no Zoho/Catalyst credentials")
    tot_p, tot_f = api_p + br_p, api_f + br_f
    s += [P("1. Summary", H1)]
    s += [P(f"<b>{len(api)+len(br)} scenarios executed this run: {tot_p} pass, {tot_f} fail.</b> HTTP/request tests (curl): {len(api)} checks, {api_p} pass / {api_f} fail. Browser tests (Playwright, headless Chromium, desktop 1366px and mobile 375px, with axe-core): {len(br)} checks, {br_p} pass / {br_f} fail. "
            "All failures were reproduced on this run's fresh install and are application defects except one check that needs data the sandbox does not have (marked Blocked). "
            f"A further 18 designed scenarios could not be executed because they need Catalyst/Zoho credentials or a CRM sandbox, and 10 cover scope items that are not built yet (sections 5 and 6). "
            "Compared with the previous baseline (API 46 pass / 33 fail of 79; browser 86 / 17 of 103) the browser result is identical and the API result differs only by 5 new checks added this run (CORS x2, error leakage x2, path traversal).")]
    s += [P("2. Environment and tool versions (pinned so results are comparable week to week)", H1)]
    env = [["Item", "Value"],
     ["Target", "Next.js 14.2.35 dev server on http://localhost:3111 started from a clean checkout; env contained no ZOHO_* or CATALYST_* variables (checked: 0 matches), NEXT_PUBLIC_BASE_URL=http://localhost:3111"],
     ["Node / npm", "Node 22.22.0, npm 10.9.4 (npm ci fails, so packages were installed with npm install in a scratch copy; src verified identical to the repo)"],
     ["Browser tooling", "playwright-core 1.56.1 with the preinstalled Chromium (/opt/pw-browsers/chromium); axe-core 4.10.2 (rules wcag2a, wcag2aa, wcag21a, wcag21aa)"],
     ["HTTP tooling", "curl 8.5.0, bash script reports/evidence/run_api_tests.sh (refuses non-local targets and requires CONFIRM_NO_CRM_CREDS=1)"],
     ["Network", "Outbound HTTPS from the app goes through the sandbox proxy (server started with NODE_USE_ENV_PROXY=1, CA bundle /root/.ccr/ca-bundle.crt, TLS verification on). With this setting the exchange-rate (Frankfurter) and location (Nominatim) calls succeed. In an intermediate attempt without the proxy those two routes failed (fetch failed): that was an environmental cause, not an app failure, and those results were discarded and re-run."],
     ["Isolation", "The app's in-memory rate limiter keeps state between runs, so the server was restarted before each full run; results above are from one clean run."],
     ["Safety", "No request could reach production CRM or Catalyst: the app has no credentials. All CRM/Catalyst access in this assessment was separate, read-only, through connectors."]]
    s += [table(env, [35*mm, W-35*mm])]
    s += [PageBreak(), P(f"3. HTTP/request tests ({len(api)} executed: {api_p} pass, {api_f} fail)", H1)]
    rows = [["#", "Group", "Scenario", "Result", "Class", "Expected / actual"]]
    for i, r in enumerate(api, 1): rows.append([str(i), E(r[1]), E(r[2]), col(r[0]), E(classify(r)), E(r[3])])
    s += [table(rows, [8*mm, 16*mm, 115*mm, 14*mm, 32*mm, W-185*mm])]
    s += [PageBreak(), P(f"4. Browser tests ({len(br)} executed: {br_p} pass, {br_f} fail)", H1)]
    s += [P("Pages: /, /properties, /shortlist, /compare, /list-your-property, /services, /kyc/city/delhi and /properties/1/test-property at each viewport; checks: page load, no horizontal scroll, no console errors, axe-core WCAG 2.1 A/AA critical/serious, no internal env-var text visible to users, link crawl of internal links, target=_blank rel, cookie consent behaviour, lead CTA.")]
    rows = [["#", "Viewport", "Group", "Scenario", "Result", "Class", "Observed"]]
    for i, r in enumerate(br, 1):
        cl = "-" if r[0] == "PASS" else "App defect"
        rows.append([str(i), E(r[4]), E(r[1]), E(r[2]), col(r[0]), cl, E(r[3][:150])])
    s += [table(rows, [8*mm, 24*mm, 15*mm, 95*mm, 14*mm, 20*mm, W-176*mm])]
    s += [PageBreak(), P("5. Designed scenarios blocked (not executed)", H1)]
    blocked = [["ID", "Scenario", "Why blocked", "What is needed"],
     ["B-01", "Search results by city / type / micromarket with real listings, pagination, sort", "App has no Catalyst credentials; /api/properties returns the 'CATALYST_PROJECT_ID is missing' error", "Catalyst project credentials for a test environment (Development Data Store holds 3 tables)"],
     ["B-02", "Property detail page shows attributes, gallery from Stratus, AI description", "Same; no valid property ID", "Credentials + a known property ID"],
     ["B-03", "Search suggestions and full-text search quality", "Same", "Credentials"],
     ["B-04", "Faceted filter counts and 'featured' ordering", "Same (and Featured=true count is 0 in Production Data Store)", "Credentials + featured rows"],
     ["B-05", "/api/leads end to end: lead appears in CRM with correct fields", "Would write to production CRM (forbidden); no CRM sandbox", "Zoho CRM sandbox + OAuth client"],
     ["B-06", "/api/lead2 end to end incl. client-chosen Lead_Source / Lead_Status", "Same", "CRM sandbox"],
     ["B-07", "/api/lead3 enquiry with Interested_Properties subform rows (Property_Name lookup)", "Same; subform inner fields not exposed by field metadata", "CRM sandbox"],
     ["B-08", "Duplicate-lead behaviour: overwrite and ID disclosure (S-04)", "Same", "CRM sandbox with seeded duplicate"],
     ["B-09", "City and micromarket dropdowns from CRM (36 cities, 94 micromarkets exist)", "ZOHO_CLIENT_ID missing", "CRM OAuth client"],
     ["B-10", "KYC city pages with data (9 KYC rows exist)", "Data Store unreachable", "Credentials"],
     ["B-11", "Market-stats widget values (Stats table has 1 row with seed defaults)", "Data Store unreachable", "Credentials"],
     ["B-12", "Compare 2-4 real properties; shortlist enquiry", "No property data", "Credentials"],
     ["B-13", "Currency and area-unit conversion on real prices", "No property data (conversion helpers exist in format.js)", "Credentials"],
     ["B-14", "Property images load from Stratus through next/image", "No image paths without data; object listing not available via connector", "Credentials"],
     ["B-15", "Production Slate site: HTTPS, response headers, caching, custom domain", "Production Slate deployment failed; no site to test. Development sites (anarock-saxzjuvb.onslate.in, anarockpropertylisting.onslate.in) were not scanned (not part of the agreed local-only method)", "Successful Production deployment"],
     ["B-16", "SEO: Rich Results Test / Search Console indexing of listing pages", "No server-rendered listing HTML; external tools out of scope", "SSR in place first"],
     ["B-17", "CRM -> Stratus -> Data Store sync and Published gating", "No function deployed; mechanism not in repo", "Deployed Functions + CRM sandbox"],
     ["B-18", "Stratus upload function (stratus_upload) behaviour and authentication", "Function is_deployed=false in both environments", "Deployment"]]
    s += [table(blocked, [12*mm, 100*mm, 90*mm, W-202*mm])]
    s += [P("6. Scenarios for scope items that are not built yet", H1)]
    nb = [["ID", "Scenario (from the SoW)", "Status"],
     ["N-01", "AI-assisted semantic search returns relevant listings", "Not built - no code"], ["N-02", "Catalyst Search faceted search and full-text", "Not built - no code/config"],
     ["N-03", "Gemini attribute generation written back to CRM as draft; schema validation; human approval before Published", "Not built - 1 of 7,295 CRM records has AI_Attributes_from_Images"],
     ["N-04", "SalesIQ chatbot answers, hands over to agent, creates CRM lead", "Not built"], ["N-05", "PageSense heatmaps, recordings, funnels, form analytics", "Not built"],
     ["N-06", "GA4 via GTM events (page views, property views, filters, gallery, chat, inquiry) gated by cookie consent", "Not built - banner exists, nothing is gated by it"],
     ["N-07", "Property view event increments view count and CRM view score", "Not built"], ["N-08", "On-demand revalidation when CRM data changes; scheduled sitemap regeneration", "Not built - no cron, no revalidate calls"],
     ["N-09", "API Gateway throttles and authenticates app APIs", "Not built - one rule for an undeployed function"], ["N-10", "Related-property recommendations quality (component exists, needs data)", "Blocked + partial"]]
    s += [table(nb, [12*mm, 170*mm, W-182*mm])]
    s += [P("7. Limitations and technical blocks", H1)]
    for t in ["Scenarios that require live Catalyst or Zoho data could not run (section 5); this is a credentials/sandbox limitation, not an app result.",
              "Tests ran against the Next.js dev server on a clean checkout, not a production build (a production build fails: see Code Review C-01). Timings are therefore indicative only.",
              "OWASP ZAP passive scan results are in the Security report; no active scan or load test was run.",
              "Automated accessibility checks cover a subset of WCAG; manual assistive-technology testing was not performed."]:
        s.append(P("- " + E(t)))
    d.build(s)

# ================================================================== 4. SCOPE COMPLETENESS
SCOPE = [
 # ref, item, status, evidence, gap
 ("3.1", "Web app on Catalyst Slate: responsive, server- and static-rendered Next.js listing interface", "Partial", "Next.js app present; responsive (no overflow at 375px on 8 pages). Slate Development apps 'Anarock' and 'nextjs' deployed (2026-10-14). Production Slate app 'anarock' deployment FAILED. Listing page server HTML is 'Loading properties...'", "No working Production deployment; listing/detail not server-rendered (Code Review C-01, C-03)"),
 ("3.1", "Image storage on Stratus", "Partial", "Bucket property-images exists in Production and Development; next.config remotePatterns allows property-images.zohostratus.in; CRM Has_Images=true on all 393 website properties", "Object contents/ACLs not verifiable via connector; bucket encryption off"),
 ("3.1", "CRM -> Stratus image sync on approval", "Partial", "Catalyst function stratus_upload exists (node24, 256MB) with an API Gateway rule", "is_deployed=false in both environments; source not in repo; no CRM trigger or cron verifiable; images do exist, so a manual or external process was used"),
 ("3.1", "AI attribute generation (Gemini 2.5 Flash+) written back to CRM as draft", "Not started", "No Gemini code or function; CRM field AI_Attributes_from_Images exists and is populated on 1 of 7,295 Properties (COQL); Data Store column AIAttributes exists", "Generation pipeline, API key use, CRM draft write-back absent (API key was reportedly supplied by client on 2026-10-16, Slack)"),
 ("3.1", "Attribute validation (schema check + human review) before Published", "Partial", "CRM has Push_to_Website (393 true) used as a manual gate; Data Store has no published flag", "No automated schema validation; app does not enforce a published/approved state (S-08); Data Store has 395 rows vs 393 flagged"),
 ("3.1", "Catalyst Data Store sync (CRM ID, attributes, image URLs)", "Partial", "Production Data Store tables: Properties (395 rows, includes crmID), KYC (9), Stats (1)", "Sync mechanism not in repo or in a deployed function/cron; 2-row drift; AI attributes not populated"),
 ("3.1", "Web app features: faceted filters", "Partial", "Filters by city/type/micromarket etc. implemented in properties route and PropertiesClient; Data Store has listings in 6 cities only (Bengaluru 195, Delhi 98, Gurugram 57, Chennai 29, Mumbai 15, Kolkata 1)", "Runtime with data not verified (blocked); Pune/Hyderabad/Noida have KYC pages but no listings"),
 ("3.1", "Web app features: inquiry forms", "Complete", "Navbar callback form, home 'post a requirement', shortlist enquiry; 7 'Listing Platform' leads exist in production CRM (2026-09-22 to 2026-10-13)", "Functionally complete; security defects S-02..S-04 and S-15"),
 ("3.1", "Web app features: full-text search", "Partial", "Suggestions endpoint and in-memory text matching over the Data Store cache", "Not Catalyst Search"),
 ("3.1", "Web app features: AI-assisted search", "Not started", "No AI/semantic search code", "-"),
 ("3.1", "Related-property recommendations", "Partial", "Detail page requests related properties (PropertyDetailClient.js:184-240)", "Quality not verifiable without data; rule-based only"),
 ("3.1", "Visitor engagement: Zoho SalesIQ (chat, bot, handover, chat leads to CRM)", "Not started", "No SalesIQ script or configuration in repo", "Entire item"),
 ("3.1", "Behaviour analytics: Zoho PageSense", "Not started", "No PageSense script in repo", "Entire item"),
 ("3.1", "SEO rendering and metadata (per-page metadata, structured data, sitemap, on-demand revalidation)", "Partial", "Home metadata, OG/Twitter tags, Organization + breadcrumb JSON-LD, sitemap.js, robots.js present", "Canonical wrong on all pages; sitemap invalid/404s/no property URLs; no listing JSON-LD; no revalidation (Code Review C-04, C-05)"),
 ("3.1", "CRM lead sync (web forms and chatbot) and property-view count sync", "Partial", "Web-form leads reach CRM (verified in live CRM); no chatbot; no view counts", "View-score pipeline and chat leads absent"),
 ("3.2", "Catalyst Slate (builds, previews, hosts, SSL, custom domain, CDN)", "Partial", "Slate apps exist; Development deployments enabled (domains *.onslate.in); Production failed", "No Production site or custom domain verified"),
 ("3.2", "Catalyst Stratus", "Partial", "Bucket in both environments", "Encryption/audit off; ACLs not verifiable"),
 ("3.2", "Catalyst Data Store", "Partial", "3 tables with 85+ property columns; App User role has INSERT/UPDATE", "No AI-attribute or image-URL structure verified; permissions too broad (S-17)"),
 ("3.2", "Catalyst Functions (CRM sync, AI calls, validation routing, lead capture, view scoring, revalidation)", "Partial", "1 function exists (stratus_upload), not deployed; lead capture is implemented in Next.js API routes instead", "5 of 6 listed functions absent"),
 ("3.2", "Catalyst Search", "Not started", "No code or config in repo; no Search service data via connector", "Entire item"),
 ("3.2", "Catalyst API Gateway (manage and secure endpoints)", "Partial", "One rule (stratus_upload, ANY)", "No rules, authentication or throttling for the app's APIs"),
 ("3.2", "Gemini 2.5 Flash and above", "Not started", "No integration", "Entire item"),
 ("3.2", "Zoho SalesIQ / PageSense (infrastructure)", "Not started", "See 3.1", "Entire item"),
 ("3.2", "Google Analytics 4 and Search Console", "Not started", "No gtag/GTM in code; Search Console not verifiable", "Entire item"),
 ("3.3", "SSR / SSG / ISR of listing and detail pages", "Partial", "Detail page has generateMetadata; listing and home are client components", "Listing/detail HTML not rendered with data"),
 ("3.3", "Per-page metadata (titles, descriptions, canonical, OG, Twitter)", "Partial", "Layout-level metadata present; detail title from URL slug", "Canonical = '/' on all pages; detail description equals home"),
 ("3.3", "Structured data: RealEstateListing, Product, Offer JSON-LD", "Not started", "Only Organization and breadcrumb JSON-LD", "Listing JSON-LD absent"),
 ("3.3", "Clean human-readable URLs (e.g. /buy/apartments-in-bangalore/<slug>)", "Partial", "/properties/{id}/{name}", "Not the SoW pattern; unknown IDs return 200"),
 ("3.3", "Dynamic sitemap.xml and robots.txt regenerated on change", "Partial", "sitemap.js and robots.js exist", "Static 4-URL list; invalid XML; no regeneration"),
 ("3.3", "Image optimisation, Core Web Vitals tuning, Slate CDN caching", "Partial", "next/image remotePatterns configured; Cache-Control headers on API routes", "3 raw <img> tags; no CWV measurement; no production deployment"),
 ("3.3", "Google Search Console setup and sitemap submission", "Not verifiable", "No access to Search Console", "-"),
 ("5.1", "Home / landing page (hero, search entry, featured listings)", "Complete", "Home loads on all viewports; hero search; Featured count in Data Store is 0", "Featured listings need data; accessibility defects"),
 ("5.1", "Listing and search-results page (server rendered, faceted)", "Partial", "Page and filters exist", "Client-rendered"),
 ("5.1", "Property-detail page (attributes, gallery, AI description, inquiry form)", "Partial", "Page exists with gallery, enquiry, related properties", "Server rendering, AI description and data verification missing"),
 ("5.1", "Location and category SEO landing pages", "Partial", "9 KYC city pages (Bengaluru, Chennai, Delhi, Gurugram, Hyderabad, Kolkata, Mumbai, Noida, Pune)", "No property-type/category landing pages"),
 ("5.1", "Inquiry/contact page plus About, Contact, Privacy Policy, Terms", "Not started", "Footer links /aboutus, /privacy-policy, /rera, /terms-of-use return 404; /services and /list-your-property exist", "Pages missing (About content reportedly received 2026-10-16)"),
 ("5.1", "System pages: dynamic sitemap.xml, robots.txt", "Partial", "Present", "See 3.3"),
 ("5.2", "Property image galleries served from Stratus", "Partial", "Gallery UI and bucket exist", "Not verifiable with data"),
 ("5.2", "Display of validated AI-generated attributes and descriptions", "Partial", "Mapper exposes aiAttributes and highlights", "No generated data (1 CRM record)"),
 ("5.2", "Property-view tracking feeding CRM view scoring", "Not started", "No code", "Entire item"),
 ("5.2", "Currency switching (INR, AED, USD, EUR, SGD)", "Complete", "/api/exchange-rates returns all five currencies (tested, pass); preference store", "-"),
 ("5.2", "Unit switching (feet, metre, square feet, square metre)", "Partial", "sqft and sqm conversion implemented (format.js, preferences.js)", "feet and metre units absent"),
 ("5.6", "GA4 via Google Tag Manager, events, Search Console link", "Not started", "No GTM/GA4 code", "Entire item"),
 ("5.6", "Cookie-consent banner", "Complete", "Banner shown on first visit; no cookies set before consent (tests pass)", "Consent does not gate any analytics yet (none exist)"),
 ("5.9", "Property-approval workflow (images -> Stratus -> Gemini -> validation -> Data Store -> revalidate)", "Not started", "No deployed function or trigger", "Entire workflow"),
 ("5.9", "Inquiry submission creates CRM lead and assigns/notifies owner", "Partial", "Lead created with Lead_Owner_Team and Lead_Source; owner assignment is CRM-side and not verifiable", "Notification rule not verifiable"),
 ("5.9", "SalesIQ chat workflow; property-view workflow", "Not started", "No code", "Entire workflows"),
 ("5.9", "Scheduled jobs: sitemap regeneration, stale-content revalidation", "Not started", "No cron jobs or job pools in Catalyst", "Entire item"),
 ("6", "Out-of-scope guard: maps, multilingual, payments, third-party listings", "Complete", "No map embeds or map libraries found in code (grep)", "Latitude/Longitude stored only"),
]
def build_scope():
    d = Doc(os.path.join(OUT, f"Anarock_Scope_Completeness_{DATE}.pdf"), "Scope Completeness Report")
    n = len(SCOPE); st = {k: sum(1 for r in SCOPE if r[2] == k) for k in ("Complete", "Partial", "Not started", "Not verifiable")}
    pct = round((st["Complete"] + 0.5 * st["Partial"]) / n * 100, 1)
    pct_strict = round(st["Complete"] / n * 100, 1)
    s = cover("Scope Completeness Report", f"Prepared by FusionHawk for Anarock Property Consultants Pvt. Ltd. | Date: {DATE} | Repository fusionhawk/Anarock, main @ {COMMIT} | Each SoW item checked against the code, Zoho CRM and Catalyst")
    s += [P("1. Executive summary", H1)]
    s += [P(f"<b>{n} SoW items checked: {st['Complete']} Complete, {st['Partial']} Partial, {st['Not started']} Not started, {st['Not verifiable']} Not verifiable.</b> "
            f"Weighted completeness (Complete = 1, Partial = 0.5, others 0) is <b>{pct}%</b>; strictly complete items are {pct_strict}%. "
            "The Next.js front end, lead capture into CRM, currency/area switching, KYC pages and the Data Store/Stratus foundations exist. Nothing in the Gemini AI, validation, Catalyst Search, SalesIQ, PageSense, GA4, view-scoring or scheduled-job parts of the SoW has been started, "
            "the only Catalyst Function is undeployed, and the Production Slate deployment has failed.")]
    s += [P("Where the evidence comes from: <b>Code</b> (repository, read and executed), <b>CRM</b> (AnarockCRM connector, read-only), <b>Catalyst</b> (anarock CLA Catalyst connector, read-only), <b>Tests</b> (this run's HTTP and browser tests). The SoW is the document in the repository (Anarock-Cla-Online-Listing-Platform Scope (1).docx), read this run (11_scope_doc_comparison.log).")]
    s += [P("2. Comparison with the Slack project tracker", H1)]
    tr = [["Source", "Figure", "Reading"],
     ["Slack tracker post 2026-10-16 10:00 IST", "430 h estimated; 345.50 h billable consumed (+1.00 non-billable); 84.50 h remaining; 'Project Completed' 80.35%; project end 23/10/2026", "Hours-based progress"],
     ["Slack tracker trend", "69.07% (12 Oct) -> 74.77% (13-14 Oct) -> 78.49% (15 Oct) -> 80.35% (16 Oct)", "+11.3 points of hours in four days"],
     ["This assessment (items)", f"{pct}% weighted; {pct_strict}% strictly complete; {st['Not started']} of {n} items not started", "Delivery progress against the SoW"],
     ["Gap", f"Hours consumed are {80.35:.1f}% of the budget while the SoW delivery measured here is about {pct}% weighted", "With 84.5 h left and the end date 7 days away, the remaining Not started items (AI pipeline, validation, Search, SalesIQ, PageSense, GA4, view scoring, scheduled jobs, deployment) are unlikely to fit"]]
    s += [table(tr, [55*mm, 140*mm, W-195*mm])]
    s += [P("Method note: the tracker measures hours, not deliverables; items are not weighted by effort here, so the percentage is an indicator, not an earned-value calculation. Some work may exist outside the repository, CRM and Catalyst (for example client-side configuration of SalesIQ or PageSense); it would show as Not started here until it is visible to the connectors.")]
    s += [PageBreak(), P("3. SoW item status", H1)]
    rows = [["#", "SoW ref", "Item", "Status", "Evidence (code / CRM / Catalyst / tests)", "Gap"]]
    for i, r in enumerate(SCOPE, 1): rows.append([str(i), r[0], E(r[1]), col(r[2]), E(r[3]), E(r[4])])
    s += [table(rows, [8*mm, 12*mm, 70*mm, 20*mm, 100*mm, W-210*mm])]
    s += [PageBreak(), P("4. CRM and Catalyst cross-check", H1)]
    cc = [["Area", "Expected by SoW / code", "Observed (read-only)", "Result"],
     ["CRM org", "Production Zoho CRM, Leads and Properties modules with bi-directional sync", "Org production, Professional edition, 100 users, paid to 2026-12-22. Properties (custom, 97 fields, 7,295 records), Leads (60 fields, 1,460 records), City (36), Micromarkets (94)", "Match; bi-directional sync not verifiable"],
     ["CRM publish gate", "Only approved properties exposed", "Push_to_Website=true on 393 of 7,295; Has_Images true on all 393", "Gate exists in CRM; Data Store has 395 rows (2 more) and the app does not check it"],
     ["CRM fields used by code", "Leads: 27 fields; Properties: 16 fields", "All 27 Leads fields found in CRM metadata; Lead_Source picklist includes 'Listing Platform'; Interested_Properties is a subform (inner fields not exposed)", "Match"],
     ["Leads from the platform", "Inquiry forms create leads", "7 leads with Lead_Source='Listing Platform' (Request a Callback 5, Post a Requirement 1, Interested Properties 1), all Not Contacted", "Working in production CRM"],
     ["Data Store tables", "Properties, KYC, Stats (code env vars)", "Same three tables in Production and Development; Properties 395 rows; KYC 9; Stats 1", "Match"],
     ["Data Store columns", "Mapper reads about 80 columns", "Columns present incl. crmID, AIAttributes, SPOCName, SPOCNumber, AchievableRent", "Match; sensitive columns exposed (S-07)"],
     ["Stratus", "Bucket property-images", "Present in both environments", "Match"],
     ["Slate", "Next.js app hosted on Slate", "Dev: 2 apps enabled; Production: 1 app, deployment failed", "Deviation"],
     ["Functions", "6 backend function types in SoW", "1 function (stratus_upload) not deployed", "Deviation"],
     ["API Gateway", "Secures app endpoints", "1 rule (stratus_upload)", "Deviation"],
     ["Env variables (names)", "ZOHO_*, CATALYST_* per README", "Production Slate deployment has none set; Development not queried", "Deviation (explains why a Production deployment could not serve data even if it built)"]]
    s += [table(cc, [32*mm, 60*mm, 120*mm, W-212*mm])]
    s += [P("5. Limitations", H1)]
    for t in ["Both connectors were enabled and answered this run. Function source, Stratus object contents, CRM workflows/blueprints/custom functions and Search Console are not visible through them, so related items are Partial or Not verifiable rather than Complete.",
              "Items depending on live data (listing results, detail data, image delivery) could not be tested end to end because the app was run without credentials; their status reflects code and configuration evidence.",
              "The Slack scope copy was not re-fetched; this run used the SoW document in the repository, as instructed. No application code was modified."]:
        s.append(P("- " + E(t)))
    d.build(s)
    return n, st, pct, pct_strict

if __name__ == "__main__":
    build_security(); build_code(); build_tests(); r = build_scope()
    print("security findings", cnt, "api", api_p, api_f, "browser", br_p, br_f, "scope", r)
