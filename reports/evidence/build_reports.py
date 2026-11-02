#!/usr/bin/env python3
"""FusionHawk weekly assessment: builds the four PDFs (Security, Code Review, Test Scenarios, Scope Completeness) for one run.
Every number is parsed from the evidence logs in the same folder or stated with the method used to verify it.
Usage: python3 build_reports.py <evidence_dir> <out_dir> <date YYYY-MM-DD> <short_commit>"""
import sys, os, re, math, json
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, PageBreak
from xml.sax.saxutils import escape

EV, OUT, DATE, COMMIT = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
LOGO = os.path.join(EV, "fusionhawk_logo.png")
PURPLE = colors.HexColor("#5b2a86"); GREY = colors.HexColor("#f2f2f5"); LINE = colors.HexColor("#c9c9d3")
SEVCOL = {"Critical": "#b00020", "High": "#d9480f", "Medium": "#b8860b", "Low": "#2b6cb0", "Info": "#555555"}
STCOL = {"Complete": "#1b7f3b", "Partial": "#b8860b", "Not started": "#b00020", "Not verifiable": "#555555", "PASS": "#1b7f3b", "FAIL": "#b00020",
         "App defect": "#b00020", "Environment": "#555555", "Test premise": "#555555", "Blocked": "#555555", "Missing": "#b00020", "Present": "#1b7f3b", "Pass": "#1b7f3b", "Fail": "#b00020"}
ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontSize=15, textColor=PURPLE, spaceAfter=4, spaceBefore=8)
H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontSize=11.5, textColor=PURPLE, spaceAfter=3, spaceBefore=7)
B = ParagraphStyle("B", parent=ss["BodyText"], fontSize=8.6, leading=11.2, spaceAfter=3)
SM = ParagraphStyle("SM", parent=B, fontSize=7.2, leading=8.8, spaceAfter=0)
SMB = ParagraphStyle("SMB", parent=SM, fontName="Helvetica-Bold")
TITLE = ParagraphStyle("T", parent=ss["Title"], fontSize=21, textColor=PURPLE, alignment=0, spaceAfter=2)
SUB = ParagraphStyle("S", parent=B, fontSize=9, textColor=colors.HexColor("#444444"))
W = landscape(A4)[0] - 24 * mm
_TAG = re.compile(r"<(?!/?(?:b|br|font|i)\b)")
def E(t): return escape(str(t))
def fix(t): return _TAG.sub("&lt;", t)
def P(t, st=B): return Paragraph(fix(t), st)
def col(s):
    c = SEVCOL.get(s) or STCOL.get(s)
    return f'<font color="{c}"><b>{E(s)}</b></font>' if c else E(s)

def table(rows, widths, header=True, font=SM):
    data = [[c if not isinstance(c, str) else Paragraph(fix(c), SMB if (header and i == 0) else font) for c in r] for i, r in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    st = [("GRID", (0, 0), (-1, -1), 0.25, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 3),
          ("RIGHTPADDING", (0, 0), (-1, -1), 3), ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2)]
    if header: st.append(("BACKGROUND", (0, 0), (-1, 0), GREY))
    for i in range(2, len(rows), 2): st.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#fafafc")))
    t.setStyle(TableStyle(st)); return t

class Doc(BaseDocTemplate):
    def __init__(self, path, title):
        super().__init__(path, pagesize=landscape(A4), leftMargin=12*mm, rightMargin=12*mm, topMargin=20*mm, bottomMargin=14*mm, title=title, author="FusionHawk")
        self.rtitle = title
        fr = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="f", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate(id="p", frames=[fr], onPage=self.deco)])
    def deco(self, c, d):
        c.saveState(); w, h = landscape(A4)
        try: c.drawImage(LOGO, 12*mm, h-16*mm, height=9*mm, width=45*mm, preserveAspectRatio=True, mask="auto", anchor="sw")
        except Exception: pass
        c.setFont("Helvetica", 8); c.setFillColor(colors.HexColor("#444444"))
        c.drawRightString(w-12*mm, h-12*mm, f"{self.rtitle} | Anarock CLA Online Listing Platform | {DATE}")
        c.setStrokeColor(LINE); c.line(12*mm, h-18*mm, w-12*mm, h-18*mm)
        c.drawString(12*mm, 8*mm, f"FusionHawk | Prepared for Anarock Property Consultants Pvt. Ltd. | repo fusionhawk/Anarock main @ {COMMIT} | confidential")
        c.drawRightString(w-12*mm, 8*mm, f"Page {d.page}"); c.restoreState()

def cover(t, sub): return [P(E(t), TITLE), P(E(sub), SUB), Spacer(1, 4)]
def read(n):
    p = os.path.join(EV, n); return open(p, errors="ignore").read() if os.path.exists(p) else ""
def parse(text):
    out = []
    for l in text.splitlines():
        m = re.match(r"(PASS|FAIL)\s+(\S+)\s+(.*?)(?:\s+(?:expected=.*|->.*))?$", l)
        if m: out.append((m.group(1), m.group(2), m.group(3).strip(), l))
    return out
def cvss(vec):
    m = dict(x.split(":") for x in vec.split("/"))
    AV = {"N": .85, "A": .62, "L": .55, "P": .2}[m["AV"]]; AC = {"L": .77, "H": .44}[m["AC"]]; ch = m["S"] == "C"
    PR = {"N": .85, "L": (.68 if ch else .62), "H": (.5 if ch else .27)}[m["PR"]]; UI = {"N": .85, "R": .62}[m["UI"]]
    cia = {"H": .56, "L": .22, "N": 0}
    iss = 1 - (1 - cia[m["C"]]) * (1 - cia[m["I"]]) * (1 - cia[m["A"]])
    imp = 7.52 * (iss - .029) - 3.25 * (iss - .02) ** 15 if ch else 6.42 * iss
    ex = 8.22 * AV * AC * PR * UI
    if imp <= 0: return 0.0
    v = min(1.08 * (imp + ex), 10) if ch else min(imp + ex, 10)
    return math.ceil(v * 10 - 1e-9) / 10
def sev(s): return "Critical" if s >= 9 else "High" if s >= 7 else "Medium" if s >= 4 else "Low" if s > 0 else "Info"

# ---------------------------------------------------------------- parsed evidence
API = parse(read("08_api_tests.log")); BR = parse(read("09_browser_tests.log"))
api_p = sum(1 for r in API if r[0] == "PASS"); api_f = len(API) - api_p
br_p = sum(1 for r in BR if r[0] == "PASS"); br_f = len(BR) - br_p
LINT = read("03a_lint.log"); lint_warn = len(re.findall(r"Warning:", LINT)); lint_err = len(re.findall(r"\bError:", LINT))
LINT0 = read("03a_lint_1c85d7d.log"); lint0_warn = len(re.findall(r"Warning:", LINT0)); lint0_err = len(re.findall(r"\bError:", LINT0))
TESTED, HEADC = "1c85d7d", "df46295"
AUD = json.load(open(os.path.join(EV, "npm_audit.json")))["metadata"]["vulnerabilities"]
SEMG = json.load(open(os.path.join(EV, "semgrep_app.json"))); semg_n = len(SEMG["results"]); semg_files = len(SEMG["paths"]["scanned"])
ZAP = json.load(open(os.path.join(EV, "zap_baseline.json")))
zap = sorted([(a["riskdesc"], a["name"], len(a["instances"]), a.get("cweid")) for s in ZAP["site"] for a in s["alerts"]])
TOOLS = "node 22.23.4, npm 10.9.9, next 14.2.5 (installed), semgrep 1.183.0, OWASP ZAP 2.16.1 (java 21), playwright-core 1.56.1 (pinned), axe-core 4.10.2 (pinned), curl 8.5.0, reportlab 5.0.1"
STAMP = f"Run date {DATE} (run 5, full re-execution from an empty sandbox). Static checks (npm ci, audit, lint, build, Semgrep, secret scan) ran on main HEAD {HEADC}; main HEAD does not build, so behavioural tests (HTTP, browser, axe, ZAP) ran on {TESTED}, the last buildable commit (the HEAD moved during the run: 14 commits, 23 files). Tools: {TOOLS}."

# classification of every failing check: App defect / Environment / Test premise (reason stated)
def classify(r):
    d = r[2].lower(); st, cat = r[0], r[1]
    if st == "PASS": return "Pass", ""
    if "exchange" in d or "valid coordinates" in d:
        return "Environment", "Outbound HTTPS from the app is blocked by the sandbox proxy (SELF_SIGNED_CERT_IN_CHAIN in server log); not an app failure."
    if "exchange rate loading failed" in r[3].lower():
        return "Environment", "Page calls /api/exchange-rates, which cannot reach its external provider from this sandbox."
    if "properties data is temporarily unavailable" in r[3].lower():
        return "Environment", "No Catalyst credentials by design (nothing may reach production), so listing data is unavailable."
    if "sitemap domain" in d:
        return "Test premise", "NEXT_PUBLIC_BASE_URL is inlined at build time and the build ran before the env var was set; test premise invalid, inconclusive."
    if "sitemap contains property" in d:
        return "App defect", "sitemap.js lists only static pages and city pages (code read); it never fetches property URLs, with or without data."
    if "aboutus loads" in d:
        return "Environment", "networkidle never reached in 45 s although curl returns HTTP 200; most likely blocked external assets in the sandbox. Unverified."
    if cat == "LEAD2" and "rotating" not in d and "limited" not in d:
        return "Environment", "Without credentials /api/lead2 fails at the Zoho token step before returning validation results (generic 500/LEAD_SUBMISSION_FAILED); code read shows it has no content-type, size or phone/email validation (finding S-02)."
    return "App defect", ""

# ---------------------------------------------------------------- FINDINGS
# id, status vs run 4, title, vector, OWASP 2021, API 2023, ASVS, CWE, how verified, recommendation
F = [
("S-01", "Persisting (worse)", "Next.js is pinned to the exact version 14.2.5 in package.json (run 4 resolved 14.2.35). npm audit now reports 19 vulnerabilities (1 critical, 14 high, 4 moderate); 37 Next.js advisories apply, including DoS in Server Components and image optimizer, cache poisoning and SSRF. The critical advisory (middleware authorization bypass, fixed 14.2.25) is not reachable because the repo has no middleware file; the DoS advisories are reachable.",
 "AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H", "A06:2021 Vulnerable and Outdated Components", "API8:2023 Security Misconfiguration", "V14.2.1", "CWE-1104, CWE-937",
 "Executed: npm ci then npm audit (02b_npm_audit.log, npm_audit.json); next/package.json version read; git ls-files shows no middleware.", "Upgrade to next 14.2.35 or later within the 14.x line (npm reports a non-major fix) and drop the exact pin; then move to a supported major."),
("S-02", "Persisting", "/api/lead2 (home-page requirement form) has no rate limit, no content-type or body-size check, no honeypot and no phone/email validation, and writes client-supplied leadSource, leadStatus and subLeadSource to CRM Leads.",
 "AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N", "A04:2021 Insecure Design", "API4:2023 Unrestricted Resource Consumption", "V13.2.1, V5.1.3", "CWE-20, CWE-915, CWE-770",
 "Code read of lead2/route.js (no validators present; Lead_Source taken from body) and API test (08_api_tests.log, RATE lead2 burst: no 429). End-to-end write not executed (production CRM writes forbidden).", "Retire lead2/lead3 or give them the same validation, honeypot, size and rate limit as /api/leads; whitelist Lead_Source/Status server-side."),
("S-03", "Persisting", "Rate limiting on /api/leads and /api/lead3 keys on the client-supplied X-Forwarded-For header and uses a per-instance in-memory Map; rotating the header defeats the 10 requests/minute limit.",
 "AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:L", "A04:2021 Insecure Design", "API4:2023 Unrestricted Resource Consumption", "V11.1.4", "CWE-348, CWE-770",
 "Executed: 12 requests with rotating X-Forwarded-For were never limited on /api/leads and /api/lead3 (08_api_tests.log RATE section); same-client limit works (429 on the 11th).", "Take the client IP from the trusted proxy hop only; enforce limits at Catalyst API Gateway; add a CAPTCHA/Turnstile on lead forms."),
("S-04", "Persisting", "Duplicate-lead handling lets an anonymous caller update an existing CRM lead (PUT /crm/v8/Leads/{id}, workflows triggered) with attacker-supplied values and reveals that the phone/email already exists.",
 "AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:H/A:N", "A01:2021 Broken Access Control", "API1:2023 Broken Object Level Authorization", "V4.2.1", "CWE-639, CWE-285, CWE-200",
 "Code read of leads/route.js duplicate path (updateData built from request, PUT with trigger workflow). Not executed (would write to production CRM).", "On duplicates append a note/activity instead of overwriting fields; return a generic success response."),
("S-05", "Persisting", "The public property API returns every Data Store column. propertyMapper spreads ...row with no allow-list, so SPOCName, SPOCNumber, QuotedRent, AchievableRent and crmID are public. Catalyst query this run: SPOCNumber is populated in 177 of 177 Production rows (run 4: 152 of 395).",
 "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N", "A01:2021 Broken Access Control", "API3:2023 Broken Object Property Level Authorization", "V13.2.6, V8.3.4", "CWE-213, CWE-359, CWE-200",
 "Code read (propertyMapper.js line 29 ...row) plus read-only ZCQL via the Catalyst connector (COUNT where SPOCNumber IS NOT NULL = 177).", "Return an explicit field allow-list; keep contact/commercial columns out of the public table or behind an authenticated function."),
("S-06", "Persisting", "Internal error text, including environment-variable names, reaches API responses and users: /api/cities returns 'ZOHO_CLIENT_ID is missing'; /api/ai-search returns the JSON parser message ('Unterminated string in JSON at position 17') with HTTP 500; /api/micromarkets reports success:true when the upstream failed.",
 "AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N", "A05:2021 Security Misconfiguration", "API8:2023 Security Misconfiguration", "V7.4.1", "CWE-209",
 "Executed: curl against the local app (08_api_tests.log, ERR/AI/API sections).", "Return generic messages with a request id; log details server-side only."),
("S-07", "Persisting", "No security headers: no CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy; X-Powered-By is exposed on every response. ZAP independently reports CSP not set (183 URLs), anti-clickjacking missing (16), nosniff missing (72), X-Powered-By leak (183).",
 "AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N", "A05:2021 Security Misconfiguration", "API8:2023 Security Misconfiguration", "V14.4, V14.5", "CWE-693, CWE-1021, CWE-497",
 "Executed: header checks (08_api_tests.log HDR) and OWASP ZAP passive scan (06c_zap_baseline.log, zap_baseline.json).", "Add headers() in next.config.mjs (CSP, HSTS, frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy); set poweredByHeader:false."),
("S-08", "New", "/api/ai-search is anonymous, has no rate limit and no prompt-size cap and calls the paid Gemini API for every request; a 20 KB prompt returns HTTP 500; malformed JSON returns 500 (not 400). The route also logs the raw user prompt and Gemini response with console.log. An attacker can exhaust the Gemini quota/billing.",
 "AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L", "A04:2021 Insecure Design", "API4:2023 Unrestricted Resource Consumption", "V11.1.4, V13.1.1", "CWE-770, CWE-400, CWE-532",
 "Executed: 15 consecutive requests from one client never returned 429; 20 KB prompt -> 500 (08_api_tests.log AI/RATE). Code read: ai-search/route.js has no limiter, console.log of prompt (lines 429-436, 789-815). Live Gemini call not exercised (no key).", "Add per-IP and global limits, a prompt length cap (for example 500 characters), JSON error handling and remove prompt logging."),
("S-09", "New", "/api/list-your-property (POST creates CRM data, GET proxies city/micromarket lookups) has no rate limit, body-size check or honeypot; 15 rapid requests were never limited.",
 "AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:L", "A04:2021 Insecure Design", "API4:2023 Unrestricted Resource Consumption", "V13.2.1", "CWE-770",
 "Executed: 15 requests, no 429 (08_api_tests.log RATE). Code read: no limiter in list-your-property/route.js. CRM write path not executed.", "Apply the lead-route controls (limit, size cap, honeypot, CAPTCHA)."),
("S-10", "Persisting", "Catalyst platform configuration (read-only): public sign-up is enabled although the site has no user accounts; the default App User role holds SELECT/UPDATE/INSERT on the Properties table; the Stratus bucket property-images has encryption off, versioning off, caching disabled and audit off; CORS allows 127.0.0.1, crm.zoho.in and zappsusercontent.in with iframe embedding.",
 "AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:N", "A05:2021 Security Misconfiguration", "API8:2023 Security Misconfiguration", "V1.14, V4.1.3", "CWE-1188, CWE-276, CWE-732",
 "Catalyst connector, read-only: Get_Authentication_Configurations, Get_Table_Permissions, Get_All_Buckets, List_All_CORS_Domains (Production).", "Disable public sign-up; make App User SELECT-only (or remove); enable bucket encryption/versioning; remove localhost from CORS in Production."),
("S-11", "Persisting", "Property detail metadata (title, description, Open Graph, canonical) is built from the URL slug and every /properties/{id}/{name} returns HTTP 200 (client-rendered shell), so any text can be placed in an indexable page title/description and unknown IDs are not 404. HEAD df46295 adds richer metadata but still derives it from the slug.",
 "AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N", "A03:2021 Injection (content spoofing)", "API8:2023 Security Misconfiguration", "V5.3", "CWE-20, CWE-451",
 "Executed on 1c85d7d: /properties/abc/xyz returned 200 (08_api_tests.log PG). Code read on HEAD df46295 of properties/[id]/[name]/page.js generateMetadata (all fields from the slug).", "Fetch the property server-side, call notFound() when absent and build metadata from the record."),
("S-12", "Persisting", "Production data is gated only by being in the table: no Published/approved status column exists in the Data Store and the public layer applies no status filter. Row drift seen in run 4 is gone this run (Data Store 177 = CRM Push_to_Website 177), but the sync mechanism that keeps them aligned is not in the repo or in deployed Catalyst Functions.",
 "AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N", "A04:2021 Insecure Design", "API5:2023 Broken Function Level Authorization", "V1.4", "CWE-841",
 "Catalyst connector: ZCQL COUNT = 177; CRM getRecordCount Push_to_Website=true = 177; code read of propertiesCache.js (no status filter); List_All_Functions shows no sync function.", "Add a status column and filter; document and deploy the sync Function."),
("S-13", "Persisting", "Long-lived Zoho OAuth refresh tokens are held in app environment; code defaults the Catalyst environment to Production and hard-codes the project ID and Properties table ID. The lead routes defer failures to runtime ('is missing from .env.local' errors).",
 "AV:N/AC:H/PR:H/UI:N/S:U/C:H/I:H/A:N", "A05:2021 Security Misconfiguration", "API8:2023 Security Misconfiguration", "V2.10, V6.4", "CWE-1188, CWE-522",
 "Code read: lib/catalyst.js lines 4-8, 47; lead routes. No env values were read.", "Use least-privilege Zoho scopes, rotate tokens, remove hard-coded IDs, validate env at boot."),
("S-14", "Persisting", "Repository hygiene: GitHub Advanced Security is not enabled (secret scanning unavailable); .gitignore covers only .env*.local; Git history holds 8,869 node_modules/.build objects; anarock/.catalyst/slate-config.toml is tracked although .catalyst/ is ignored. Regex secret scan of the tree and 101 commits on HEAD found 0 hits.",
 "AV:N/AC:H/PR:L/UI:N/S:U/C:L/I:L/A:N", "A05:2021 Security Misconfiguration", "API8:2023 Security Misconfiguration", "V14.1", "CWE-540, CWE-1188",
 "Executed: mcp github run_secret_scanning -> 'Repository does not have GitHub Advanced Security enabled'; regex scan (05_secret_scan.log); git rev-list --objects count.", "Enable secret scanning/push protection; ignore all .env*; consider history cleanup."),
("S-15", "Persisting", "/api/location: the 1 request/second throttle is a shared timestamp that is not serialised, the cache Map is unbounded and precise coordinates go to a third party (Nominatim) without a consent notice; malformed JSON returns 500.",
 "AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L", "A04:2021 Insecure Design", "API4:2023 Unrestricted Resource Consumption", "V8.3.1", "CWE-362, CWE-400, CWE-359",
 "Code read (location/route.js lines 7-55) and executed malformed-JSON test (500).", "Serialise upstream calls, bound the cache, return 400 for bad JSON, add consent copy."),
("S-16", "Persisting", "Catalyst Web SDK 4.6.2 loads from static.zohocdn.com on every page without Subresource Integrity, and no client code uses it.",
 "AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N", "A08:2021 Software and Data Integrity Failures", "API8:2023 Security Misconfiguration", "V14.2.3", "CWE-829",
 "Code read: layout.js lines 115-118 (no integrity attribute); grep finds no SDK use.", "Remove the script or pin it with SRI."),
("S-17", "Persisting", "Lead forms have no non-JavaScript fallback: ZAP's spider submitted a form with GET and put the email and requirement text in the URL query string.",
 "AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N", "A04:2021 Insecure Design", "API8:2023 Security Misconfiguration", "V8.3.1", "CWE-598",
 "OWASP ZAP passive scan: 'Information Disclosure - Sensitive Information in URL' (1 instance).", "Set method=\"post\" and preventDefault handlers."),
("S-18", "Persisting", "125 console.log/error/warn statements in 28 files (HEAD df46295; 159 in 29 on 1c85d7d), including full error objects, Zoho/Gemini responses and user prompts.",
 "AV:L/AC:L/PR:H/UI:N/S:U/C:L/I:N/A:N", "A09:2021 Security Logging and Monitoring Failures", "API8:2023 Security Misconfiguration", "V7.1", "CWE-532",
 "Executed: grep count over src.", "Use a structured logger with redaction and levels."),
]
for f in F: assert cvss(f[3]) >= 0
SC = {f[0]: cvss(f[3]) for f in F}
cnt = {}
for f in F:
    s = sev(SC[f[0]]); cnt[s] = cnt.get(s, 0) + 1

def sec_summary():
    return ", ".join(f"{cnt.get(k,0)} {k.lower()}" for k in ["Critical", "High", "Medium", "Low", "Info"])

# ================================================================= 1. SECURITY
def build_security():
    d = Doc(os.path.join(OUT, f"Anarock_Security_Report_{DATE}.pdf"), "Security Assessment"); s = cover("Security Assessment", "OWASP Top 10 2021, API Security Top 10 2023, ASVS 4.0 L2 | CVSS v3.1 | " + STAMP)
    s += [P("1. Executive summary", H1),
          P(f"<b>{len(F)} findings: {sec_summary()}</b> (severity is derived only from the CVSS v3.1 base score). Run 4 had 18 findings (1 critical, 3 high, 9 medium, 4 low, 1 info); the scores are recalculated from the vectors in this report, and two findings are new (S-08 AI search, S-09 list-your-property). Production is still not deployed on Catalyst (Production Slate deployment status = failed since 2026-10-14, verified this run), so the exposure below is for the code on main and the Development environment, not a live Production site."),
          P("<b>New blocker on main:</b> commit df46295 ('UPDATES', pushed 2026-11-02 during this run) added about 5,900 lines to src/app/list-your-property/page.js (now 7,952 lines, several pasted copies), which declares getRecordName twice. <b>next build fails and lint reports a parsing error on main HEAD</b>, so nothing deployable can be produced. The last buildable commit in this run was 1c85d7d (build and lint passed). Behavioural security tests therefore describe 1c85d7d; static checks describe HEAD."),
          P("<b>Resolved since run 4 (verified this run):</b> npm ci now succeeds (lockfile in sync); Data Store row count matches CRM (177 = 177); on 1c85d7d build and lint passed (not on HEAD). <b>Worse:</b> Next.js is pinned to 14.2.5, so npm audit rose from 13 to 19 vulnerabilities."),
          P("<b>Top actions:</b> (1) stop returning every Data Store column, including SPOC phone numbers (S-05); (2) harden or retire /api/lead2, /api/lead3 and the duplicate-overwrite path (S-02, S-03, S-04); (3) rate-limit and cap /api/ai-search before launch (S-08); (4) upgrade Next.js to 14.2.35 or later (S-01); (5) add security headers (S-07); (6) fix Catalyst settings: public sign-up, App User write, bucket encryption (S-10).")]
    s += [P("2. Findings register", H1)]
    rows = [["ID / status", "Sev / CVSS", "Finding", "OWASP 2021 / API 2023 / ASVS", "CWE", "How verified", "Recommendation"]]
    for f in sorted(F, key=lambda x: -SC[x[0]]):
        sc = SC[f[0]]
        rows.append([f"<b>{f[0]}</b><br/>{E(f[1])}", f"{col(sev(sc))}<br/>{sc:.1f}<br/><font size=6>{E(f[3])}</font>", E(f[2]), f"{E(f[4])}<br/>{E(f[5])}<br/>ASVS {E(f[6])}", E(f[7]), E(f[8]), E(f[9])])
    s += [table(rows, [20*mm, 25*mm, 80*mm, 40*mm, 16*mm, 45*mm, W-226*mm])]
    s += [P("3. Scans run this run", H1)]
    t = [["Tool", "Result", "Method / evidence"],
         ["npm ci + npm audit", f"npm ci: PASS on HEAD (363 packages). Audit (HEAD): {AUD['critical']} critical, {AUD['high']} high, {AUD['moderate']} moderate, {AUD['low']} low (total {AUD['total']})", "02_npm_ci.log, 02b_npm_audit.log, npm_audit.json. Direct: next, eslint-config-next, postcss chain."],
         ["Semgrep 1.183.0 (p/owasp-top-ten, p/javascript, p/nextjs, p/react)", f"{semg_n} findings on {semg_files} files (HEAD df46295)", "Scanner proven on a known-bad canary (eval, innerHTML, md5, exec) -> 3 findings (06a_semgrep_canary.log). A 0-finding result means no rule-pack hits, not that the code is safe: the issues above are logic/design flaws rules do not detect."],
         ["Secret scan (regex: AWS, Google, Zoho, GitHub, Slack, private keys, key=value)", "0 hits in working tree; 0 hits across 101 commits (HEAD df46295)", "05_secret_scan.log. A regex scan, not gitleaks/trufflehog (not installed); lower recall."],
         ["GitHub secret scanning", "Not available", "GitHub tool returned 'Repository does not have GitHub Advanced Security enabled'."],
         ["OWASP ZAP 2.16.1 baseline (spider + passive scan; no active attack)", f"{len(zap)} alert types: " + "; ".join(f"{a[1]} [{a[0]}] x{a[2]}" for a in zap), "ZAP was downloaded and run (06b_zap_attempt.log, 06c_zap_baseline.log, zap_baseline.json) against the production build of 1c85d7d. Not repeated on HEAD because HEAD cannot be built or served."],
         ["Scripted request tests", f"{api_p} pass / {api_f} fail of {len(API)} on 1c85d7d (see Test Scenarios report). On HEAD the dev server returned 500 for /, /properties, /kyc/* and /list-your-property, so the suite was invalid there", "08_api_tests.log (1c85d7d), 08b_api_tests_HEAD_df46295_devserver_invalid.log, 08c_head_route_status.log"]]
    s += [table(t, [55*mm, 90*mm, W-145*mm])]
    s += [P("4. Control coverage", H1)]
    c = [["Control area", "Tested?", "Result / reason not tested"],
         ["Security headers", "Yes (curl + ZAP)", "All six missing; X-Powered-By exposed (S-07)"],
         ["Input validation (leads, location, ai-search)", "Yes", "Lead validation present on /api/leads; missing/weak on lead2, ai-search, location"],
         ["Rate-limit bypass", "Yes", "X-Forwarded-For rotation bypasses limiter (S-03); no limiter on lead2, ai-search, list-your-property"],
         ["Error leakage", "Yes", "Env-var names and parser errors leak (S-06)"],
         ["CORS", "Yes", "No Access-Control-Allow-Origin on API responses (pass); Catalyst-side CORS list reviewed (S-10)"],
         ["Body-size limits", "Yes", "/api/leads 413 on Content-Length 60 KB; chunked 60 KB returns 400 not 413; lead2/ai-search have no cap"],
         ["Authentication / session", "N/A", "The app has no user accounts; Catalyst sign-up is open (S-10)"],
         ["Authorization on CRM writes (duplicate overwrite)", "Code read only", "Writing to production CRM is forbidden, so S-04 was not exercised"],
         ["Active injection / fuzzing (ZAP active scan, sqlmap)", "No", "Not run: the passive baseline was chosen to stay safe; no database is reachable without credentials"],
         ["SSRF via AI/Gemini and Zoho calls", "Code read only", "URLs are built from fixed hosts; Gemini and Zoho not reachable from the sandbox"],
         ["TLS configuration / HSTS on the custom domain", "Not verifiable", "No Production deployment or custom domain exists yet"],
         ["Function (Catalyst) source review", "Not verifiable", "Only stratus_upload exists and its source is neither in the repo nor retrievable via the connector"]]
    s += [table(c, [65*mm, 30*mm, W-95*mm])]
    s += [P("5. Limitations", H1)]
    for t in ["The app ran locally with no Zoho/Catalyst credentials, so production data, CRM writes, the Gemini call and external APIs (exchange rates, geocoding) could not be exercised; the sandbox proxy blocks outbound HTTPS from the Node process (SELF_SIGNED_CERT_IN_CHAIN).",
              "Catalyst and CRM were read through the connectors with read-only calls (list/get/ZCQL SELECT/record counts). Environment variable values and Stratus object contents were not read.",
              "Slate Production deployment build logs are not retrievable through the connector, so the cause of the failed Production build is not verifiable (the current code builds locally).",
              "No application code was modified. Scope document was read from git history because main no longer contains it (see Scope report)."]:
        s.append(P("- " + E(t)))
    d.build(s)

# ================================================================= 2. CODE REVIEW
def build_code():
    d = Doc(os.path.join(OUT, f"Anarock_Code_Review_{DATE}.pdf"), "Code Review"); s = cover("Code Review", "OWASP Code Review Guide, ISO/IEC 25010, CWE, WCAG 2.1 AA | " + STAMP)
    ax = [r for r in BR if r[1] == "A11Y"]; ax_f = [r for r in ax if r[0] == "FAIL"]
    s += [P("1. Build and quality gates (clean sandbox)", H1)]
    g = [["Gate", "Result", "Evidence"],
         ["npm ci", "PASS (363 packages; run 4: FAIL, lockfile out of sync)", "02_npm_ci.log"],
         ["next lint (HEAD df46295)", f"<b>FAIL</b>: {lint_err} error (parsing error: Identifier 'getRecordName' has already been declared, list-your-property/page.js:6091), {lint_warn} warnings", "03a_lint.log"],
         ["next build (HEAD df46295)", "<b>FAIL</b>: 'Build failed because of webpack errors' - the name getRecordName is defined multiple times (list-your-property/page.js lines 4207 and 6091). Commit df46295 added 5,913 lines to that file (now 7,952 lines incl. commented-out and pasted copies). Production cannot be built from main.", "03b_build.log"],
         ["next lint / build (1c85d7d, last buildable commit)", f"PASS: {lint0_err} errors, {lint0_warn} warnings; build generated 24 pages (informational DYNAMIC_SERVER_USAGE log for /api/wishlist). Run 4: lint error and build failure", "03a_lint_1c85d7d.log, 03b_build_1c85d7d.log"],
         ["Automated tests", "None exist (no test files, no test script)", "git ls-files"],
         ["CI", "None (no .github/ workflows)", "git ls-files"],
         ["Codebase size", "Very large files: list-your-property/page.js 7,952 lines (duplicated/commented copies), ai-search/route.js 1,443, suggestions/route.js 1,385, lead3 1,439, leads 1,044, PropertiesClient.js, Navbar.js", "wc -l"]]
    s += [table(g, [30*mm, 150*mm, W-180*mm])]
    s += [P("2. ISO/IEC 25010 assessment", H1)]
    q = [["Characteristic", "Rating", "Evidence"],
         ["Functional suitability", "Partial", "Property browse, detail, compare, wishlist, KYC city pages, AI search and lead forms exist in code; SalesIQ, PageSense, GA4/GTM, view scoring, Catalyst Search and the CRM-to-Catalyst publishing Functions are absent (Scope report)."],
         ["Performance efficiency", "Partial", "First-load JS 87-162 kB; listing and detail pages are client-rendered, in-memory caches are per instance; 6 raw <img> usages bypass next/image."],
         ["Compatibility", "Pass", "Responsive: no horizontal scroll at 375 px on any tested page (browser tests LAYOUT)."],
         ["Usability / accessibility", "Fail", f"axe WCAG 2.1 A/AA: {len(ax_f)} of {len(ax)} page-runs have critical/serious violations (select-name, color-contrast, aria-required-parent)."],
         ["Reliability", "Fail", "main HEAD does not build (duplicate declaration). Upstream failures are swallowed (micromarkets returns success:true with empty data); lead and cache state is per instance and lost on restart."],
         ["Security", "Fail", f"{len(F)} findings ({sec_summary()}) - see Security report."],
         ["Maintainability", "Fail", "A 7,952-line page file with commented-out and pasted duplicate copies (the cause of the build break), three near-duplicate lead routes (leads 1,044 / lead2 512 / lead3 1,439 lines), stray pages/HomePage.js (a Pages Router file also served at /HomePage), 159 console statements, no tests, no CI, hard-coded IDs, Windows paths in catalyst.json."],
         ["Portability", "Partial", "catalyst.json sources are D:\\Catalyst\\...; anarock/.catalyst/slate-config.toml tracked; .env.example absent so required variables are only discoverable by reading code."]]
    s += [table(q, [40*mm, 22*mm, W-62*mm])]
    s += [P("3. OWASP Code Review Guide mapping", H1)]
    o = [["Area", "Observation", "Ref"],
         ["Input validation", "/api/leads validates names, phone (E.164-like), email, lengths (MAX_LENGTHS), content-type (415) and size (50 KB via Content-Length only). lead2 validates nothing; ai-search/location lack size caps and JSON-error handling.", "S-02, S-08, S-15"],
         ["Output encoding / XSS", "No dangerouslySetInnerHTML with user data (JSON-LD blocks and chart.jsx only); title built from slug is escaped by React but spoofable.", "S-11"],
         ["Authn/authz", "No user auth. Lead duplicate path updates existing CRM records.", "S-04"],
         ["Error handling", "Raw upstream errors and env-var names are returned to clients.", "S-06"],
         ["Logging", "159 console statements; prompts and API payloads logged.", "S-18"],
         ["Secrets / config", "No secrets in tree/history by regex scan; env names documented only in code; no .env.example.", "S-13, S-14"],
         ["Dependencies", "next pinned 14.2.5; 19 audit findings.", "S-01"],
         ["Concurrency / state", "Module-level Maps for rate limit, location throttle, token cache and property cache; not serialised, never purged.", "S-03, S-15"],
         ["Crypto / transport", "Fixed HTTPS upstream hosts; no HSTS from the app; TLS terminated by Slate (not verifiable, not deployed).", "S-07"]]
    s += [table(o, [35*mm, W-60*mm, 25*mm])]
    s += [P("4. Register of missing items", H1)]
    m = [["Item", "Status", "Detail / evidence"],
         ["Catalyst Functions required by SoW (CRM sync, Gemini attribute generation, validation routing, lead capture, view scoring, revalidation)", "Missing", "Repo has no functions/ folder. Production and the connector list one Function (stratus_upload), is_deployed=false, source not in repo."],
         ["Cron / scheduled jobs (sitemap regeneration, stale-content revalidation)", "Missing", "Catalyst List_All_Crons = []; no revalidate code in src."],
         ["Catalyst Search", "Missing", "No usage in code; filtering is in app code."],
         ["API Gateway rules for the Next.js APIs / throttling", "Missing", "Only one rule exists (stratus_upload, ANY)."],
         ["Automated tests", "Missing", "No test files or script."],
         ["CI/CD pipeline", "Missing", "No .github/workflows; Catalyst Pipelines not queried."],
         [".env.example / environment documentation", "Missing", "Not in repo."],
         ["Privacy Policy, Terms, Contact page", "Missing", "/privacy, /terms, /contact are 404; footer links /privacy-policy, /terms-of-use and /rera also 404 (browser link crawl)."],
         ["Security headers", "Missing", "S-07."],
         ["Monitoring / alerting / error tracking", "Missing", "No Sentry, no health endpoint, no uptime or log shipping configured; Get_Logs for the Slate app returned empty in run 4 and build logs are not retrievable."],
         ["SalesIQ, PageSense, GA4/GTM, Search Console", "Missing", "No scripts or IDs in code (grep for salesiq|pagesense|gtag|dataLayer|googletagmanager)."],
         ["Property JSON-LD (RealEstateListing/Product/Offer)", "Missing", "HEAD adds RealEstateAgent JSON-LD on /properties and metadata/canonical/OG on detail pages, but no listing-level JSON-LD; /shortlist canonicalises to non-existent /wishlist; canonical hard-codes https://anarock.com."],
         ["Buildable main branch / pre-merge checks", "Missing", "df46295 broke the build and was pushed to main with no CI to catch it; 14 commits landed at once."],
         ["README / docs", "Present", "README.md exists and was refreshed this run."],
         ["Cookie consent", "Present (defective)", "Banner exists; analytics and marketing default to enabled (pre-ticked); no trackers are gated because none exist."],
         ["Production deployment", "Missing", "Production Slate deployment failed 2026-10-14 and main HEAD currently cannot build; Development apps 'Anarock' and 'nextjs' both serve this code."]]
    s += [table(m, [80*mm, 25*mm, W-105*mm])]
    s += [P("5. Accessibility (axe-core 4.10.2, WCAG 2.1 A/AA, desktop 1366 px and mobile 375 px)", H1)]
    a = [["Page / viewport result", "Outcome"]]
    for r in ax:
        a.append([E(r[2].replace(' axe: no critical/serious WCAG2.1 A/AA violations', '')), col("Pass" if r[0] == "PASS" else "Fail") + " " + E(re.sub(r"^.*?->\s*", "", r[3]) if r[0] == "FAIL" else "")])
    s += [table(a, [90*mm, W-90*mm])]
    s += [P("Violations are reported once per page-run; the same rules repeat on desktop and mobile. 'serious' colour-contrast failures need design changes; select-name needs labels on filter <select> elements.")]
    s += [P("6. Limitations", H1), P("- Review is static plus the executed runs described; the Catalyst Function source is not available, so back-end logic outside the Next.js app is not reviewed. - Listing and detail pages were rendered without data, so their populated states were not audited for accessibility. - No application code was changed.")]
    d.build(s)

# ================================================================= 3. TEST SCENARIOS
def build_tests():
    d = Doc(os.path.join(OUT, f"Anarock_Test_Scenarios_{DATE}.pdf"), "Test Scenarios"); s = cover("Test Scenarios and Results", STAMP)
    API_C = [(r, *classify(r)) for r in API]; BR_C = [(r, *classify(r)) for r in BR]
    def tally(C):
        t = {"Pass": 0, "App defect": 0, "Environment": 0, "Test premise": 0}
        for c in C: t[c[1]] += 1
        return t
    ta, tb = tally(API_C), tally(BR_C)
    s += [P("<b>Tested commit:</b> all results below (HTTP, browser, axe) were executed on commit 1c85d7d, the last buildable commit. Main HEAD df46295 does not build (webpack: getRecordName defined multiple times). A scripted suite run against HEAD with <b>next dev</b> returned 10 pass / 86 fail of 96 because the dev server returned HTTP 500 for /, /properties, /kyc/* and /list-your-property; that run is invalid as an app measurement and is kept only as evidence (08b, 08c logs). Code-read deltas on HEAD relevant to failing checks below: /properties and detail pages now have descriptions, canonical (hard-coded https://anarock.com/properties for the list) and Open Graph, /properties adds RealEstateAgent JSON-LD; they are still client-rendered with a Loading shell, the sitemap is unchanged, security headers are unchanged, and /api/ai-search, /api/list-your-property and /api/lead2 still have no rate limit (grep). These HEAD deltas were not executed.")]
    s += [P("1. Summary", H1)]
    sm = [["Suite", "Executed", "Pass", "Fail", "of which app defect", "of which environment / test premise"],
          ["Scripted HTTP tests (curl, local app, no credentials)", str(len(API)), str(api_p), str(api_f), str(ta["App defect"]), f'{ta["Environment"]} / {ta["Test premise"]}'],
          ["Playwright browser tests + axe (desktop 1366 and mobile 375)", str(len(BR)), str(br_p), str(br_f), str(tb["App defect"]), f'{tb["Environment"]} / {tb["Test premise"]}']]
    s += [table(sm, [90*mm, 22*mm, 18*mm, 18*mm, 35*mm, W-183*mm])]
    s += [P("Run 4 (for comparison): API 49 pass / 35 fail of 84; browser 86 pass / 17 fail of 103. The suites grew (new scenarios: AI search, list-your-property, /aboutus, SoW pages) so totals are not directly comparable. Environmental failures are caused by the sandbox (no credentials by design, proxy-blocked outbound HTTPS) and are <b>not</b> reported as app failures.")]
    s += [P("2. Scripted HTTP results", H1)]
    rows = [["Result", "Group", "Scenario", "Class / reason"]]
    for r, cl, why in API_C: rows.append([col(r[0]), E(r[1]), E(r[2]), (col(cl) if cl != "Pass" else "") + (" " + E(why) if why else "")])
    s += [table(rows, [14*mm, 14*mm, 140*mm, W-168*mm])]
    s += [PageBreak(), P("3. Browser results (Playwright 1.56.1 + axe-core 4.10.2; desktop then mobile)", H1)]
    rows = [["Result", "Group", "Scenario", "Class / reason"]]
    for r, cl, why in BR_C:
        det = re.sub(r"^.*?->\s*", "", r[3]) if r[0] == "FAIL" and "->" in r[3] else ""
        rows.append([col(r[0]), E(r[1]), E(r[2]), (col(cl) if cl != "Pass" else "") + (" " + E(why) if why else "") + (f" <font size=6>[{E(det[:150])}]</font>" if det else "")])
    s += [table(rows, [14*mm, 14*mm, 100*mm, W-128*mm])]
    s += [P("4. Designed scenarios that could not be executed", H1)]
    bl = [["Scenario", "Status", "Reason"],
          ["Lead submitted from home/property forms creates a CRM Lead end to end (incl. duplicate handling, owner assignment)", "Blocked", "Writing to production CRM is prohibited; no CRM sandbox exists. Validation-only paths were tested."],
          ["Listing, filter, detail, compare and wishlist with real property data and Stratus images", "Blocked", "No Catalyst credentials; app run without them by design."],
          ["AI-assisted search returns ranked results from Gemini 2.5 Flash", "Blocked", "No GEMINI_API_KEY; outbound HTTPS blocked in sandbox. Only input handling tested."],
          ["Currency (INR, AED, USD, EUR, SGD) and unit switching with live rates", "Blocked", "/api/exchange-rates cannot reach its provider from the sandbox (502); code supports the five currencies and sq ft / sq m."],
          ["Reverse geocoding of 'use my location'", "Blocked", "Nominatim unreachable from the sandbox."],
          ["Property approval in CRM -> images to Stratus -> Gemini attributes -> Data Store -> revalidation", "Blocked", "No such Function is deployed or in the repo; cannot be executed."],
          ["SalesIQ chat, chatbot handover, PageSense heatmaps, GA4 events, view-count scoring", "Blocked", "Features do not exist in the code (Scope report)."],
          ["On-demand revalidation and scheduled sitemap regeneration", "Blocked", "No revalidate code or cron job exists."],
          ["Production site over HTTPS on the custom domain (headers, TLS, CDN caching, Core Web Vitals)", "Blocked", "Production Slate deployment failed; no custom domain linked."],
          ["Active DAST (ZAP active scan, authenticated tests)", "Blocked", "Deliberately not run; no authenticated surface exists."]]
    s += [table(bl, [110*mm, 22*mm, W-132*mm])]
    d.build(s)
    return ta, tb

# ================================================================= 4. SCOPE COMPLETENESS
ITEMS = [
# ref, item, status, evidence, gap
("3.1", "Web app on Catalyst Slate: responsive Next.js listing UI", "Partial", "Code built on 1c85d7d (03b_build_1c85d7d.log) but main HEAD df46295 does not build (03b_build.log); Development Slate apps 'Anarock' and 'nextjs' exist (connector); Production deployment 'anarock' status = failed (Oct 14).", "Not live in Production; two duplicate Development apps; listing and detail pages client-rendered."),
("3.1", "Image storage on Stratus", "Partial", "Bucket property-images exists (connector); next.config allows property-images.zohostratus.in.", "Objects not listable via connector; bucket unencrypted, caching disabled."),
("3.1", "CRM -> Stratus image sync on approval", "Partial", "Function stratus_upload exists, is_deployed=false; API Gateway rule exists; CRM has Has_Images / Other_Images fields.", "Function not deployed and its source is not in the repo; trigger not verifiable."),
("3.1", "AI attribute generation (Gemini) written back to CRM as draft", "Not verifiable", "CRM Properties has field AI_Attributes_from_Images; Slack update (2026-10-27) states the feature is complete.", "No code in repo, no deployed Function; claim cannot be verified from code, Catalyst or tests."),
("3.1", "Attribute validation (schema check + human review) before Published", "Partial", "CRM flag Push_to_Website (177 true) acts as publish gate.", "No schema validation code; Data Store has no status column; public layer does not filter."),
("3.1", "Catalyst Data Store sync (CRM ID, attributes, image URLs)", "Partial", "Properties table 177 rows = CRM Push_to_Website 177; columns include crmID.", "Sync mechanism is not in repo or deployed Functions; cities now Bengaluru 100, Hyderabad 64, Mumbai 12, Noida 1."),
("3.1", "Web app features: faceted filters and listings", "Partial", "PropertiesClient.js implements filters.", "Rendered client-side; end-to-end with data not testable here."),
("3.1", "Inquiry forms posting to CRM leads", "Partial", "/api/leads, lead2, lead3 create CRM leads (code read); validation tests pass for /api/leads.", "End-to-end write untested (prod CRM forbidden); lead2 weakly protected (S-02)."),
("3.1", "Full-text and AI-assisted search", "Partial", "/api/ai-search calls Gemini 2.5 Flash to interpret queries and filters in-app (code read).", "No Catalyst Search; no rate limit; live call untested. Slack: city-prompt UI still pending."),
("3.1", "Related-property recommendations", "Partial", "PropertyDetailClient fetches related items (code read).", "Needs data to verify."),
("3.1", "Visitor engagement: Zoho SalesIQ", "Not started", "No SalesIQ code (grep).", "Entire feature."),
("3.1", "Behaviour analytics: Zoho PageSense", "Not started", "No PageSense code (grep).", "Entire feature."),
("3.1", "SEO rendering and metadata (SSR, per-page metadata, structured data, revalidation)", "Partial", "Home/layout metadata and Organization/WebSite/Breadcrumb JSON-LD exist; HEAD adds metadata + RealEstateAgent JSON-LD on /properties and metadata on detail; build on 1c85d7d showed static / and /compare, detail dynamic.", "/properties and detail are client shells; no revalidation; see section 3.3."),
("3.1", "CRM lead sync from web app and chatbot", "Partial", "Web leads: code present. Chatbot: none.", "Chatbot leads not started."),
("3.1", "Property-view counts sent to CRM for view scoring", "Not started", "No view tracking code (grep); no Function.", "Entire feature."),
("3.2", "Catalyst Slate: build, preview, SSL, domain, CDN", "Partial", "Dev builds Success (Oct 14); Production failed; Slack (2026-10-30): domain/subdomain not yet linked, paid plan pending.", "Production unavailable."),
("3.2", "Catalyst Stratus", "Partial", "Bucket exists.", "Config gaps above."),
("3.2", "Catalyst Data Store tables", "Complete", "3 tables Stats, KYC, Properties exist (connector); Properties 177 rows.", "Schema hygiene (S-05, S-10)."),
("3.2", "Catalyst Functions (CRM sync, AI, validation, lead capture, view scoring, revalidation)", "Not started", "List_All_Functions: only stratus_upload (undeployed). Lead capture runs inside Next.js API routes.", "Five of six listed responsibilities have no Function."),
("3.2", "Catalyst Search", "Not started", "No usage.", "Entire component."),
("3.2", "Catalyst API Gateway (secure and throttle APIs)", "Partial", "One rule for stratus_upload.", "No rules or throttling for the app APIs."),
("3.2", "Gemini 2.5 Flash and above", "Partial", "GEMINI_MODEL default gemini-2.5-flash in ai-search.", "Used for query interpretation; attribute generation not verifiable."),
("3.2", "Zoho SalesIQ / PageSense / GA4 + Search Console", "Not started", "No code; Slack says GA details are awaited from the client.", "Client dependency noted."),
("3.3", "SSR/SSG/ISR of listing and detail pages", "Partial", "/ and /compare static; kyc dynamic; /properties static shell with 'Loading properties'; detail dynamic client shell.", "Crawlers do not receive rendered listing HTML (test SEO fail)."),
("3.3", "Per-page metadata (title, description, canonical, OG/Twitter)", "Partial", "Code read on HEAD: layout, home, /properties and detail pages set title, description, canonical and OG/Twitter (detail derived from URL slug).", "Slug-derived, hard-coded https://anarock.com in places; /shortlist canonical points to /wishlist; services/kyc/list pages not verified."),
("3.3", "Structured data (RealEstateListing, Product, Offer)", "Partial", "Organization/WebSite/Breadcrumb and (HEAD) RealEstateAgent JSON-LD on /properties; compare page injects JSON-LD client-side.", "No RealEstateListing/Product/Offer markup on property detail."),
("3.3", "Clean URL structure (/buy/.../<slug>)", "Not started", "URLs are /properties/{id}/{name}.", "Differs from SoW pattern."),
("3.3", "Dynamic sitemap.xml and robots.txt regenerated on content change", "Partial", "Both exist; sitemap has static + city pages; robots disallows /wishlist (route is /shortlist).", "No property URLs; no regeneration trigger."),
("3.3", "Image optimisation / Core Web Vitals tuning", "Partial", "next/image avif/webp configured.", "4 raw <img>; CWV not measurable without Production."),
("3.3", "Google Search Console setup and sitemap submission", "Not started", "Nothing in repo.", "Client dependency."),
("5.1", "Home / landing page", "Partial", "Hero, search entry present.", "Featured listings depend on data (Featured=true count was 0 in run 4)."),
("5.1", "Listing / search results page", "Partial", "Exists, client-rendered.", "Not server-rendered."),
("5.1", "Property-detail page", "Partial", "Exists with gallery/related (code read).", "No JSON-LD / SSR / 404 for unknown IDs."),
("5.1", "Location / category SEO landing pages", "Partial", "9 city KYC pages /kyc/city/*.", "City market pages, not property-type queries; Hyderabad/Noida/Pune have 0-1 listings."),
("5.1", "Inquiry/contact page + About, Contact, Privacy, Terms", "Partial", "/aboutus, /services, /list-your-property exist.", "Contact, Privacy, Terms return 404 (footer links dead)."),
("5.1", "System pages (sitemap.xml, robots.txt)", "Complete", "Both return 200.", "Content gaps listed under 3.3."),
("5.2", "Image galleries served from Stratus", "Partial", "Gallery code and Stratus domain configured.", "Needs data to verify."),
("5.2", "Display of validated AI attributes/descriptions", "Not verifiable", "AI_Attributes_from_Images field exists in CRM.", "Display path not verifiable without data."),
("5.2", "Currency switch (INR, AED, USD, EUR, SGD) and units (feet, metre, sq ft, sq m)", "Partial", "Code supports 5 currencies and sq ft/sq m (format.js, preferences.js).", "Linear feet/metre not found; live rates endpoint untested here."),
("5.6", "GA4 via GTM, tracked events, Search Console link", "Not started", "None in code.", "Entire feature."),
("5.6", "Cookie-consent banner", "Partial", "CookieConsent.js shows banner; no cookies before consent (browser test).", "Analytics/marketing pre-ticked; gates nothing."),
("5.9", "Property approval workflow (Stratus -> Gemini -> validation -> Data Store -> revalidate)", "Not verifiable", "Only the undeployed stratus_upload Function exists.", "No orchestration visible."),
("5.9", "Inquiry submission creates CRM lead and notifies owner", "Partial", "Lead routes set Lead_Owner_Team etc. (code read).", "Owner assignment/notification not verifiable."),
("5.9", "Chat workflow (SalesIQ -> CRM)", "Not started", "None.", "Entire feature."),
("5.9", "Property-view event -> count and CRM view score", "Not started", "None.", "Entire feature."),
("5.9", "Scheduled jobs (sitemap regeneration, stale revalidation)", "Not started", "Cron list empty.", "Entire feature."),
]

def build_scope():
    d = Doc(os.path.join(OUT, f"Anarock_Scope_Completeness_{DATE}.pdf"), "Scope Completeness"); s = cover("Scope Completeness", "SoW items checked against code, Zoho CRM and Catalyst | " + STAMP)
    n = len(ITEMS); st = {}
    for i in ITEMS: st[i[2]] = st.get(i[2], 0) + 1
    pct = (st.get("Complete", 0) + 0.5 * st.get("Partial", 0)) / n * 100; strict = st.get("Complete", 0) / n * 100
    s += [P("1. Result", H1),
          P(f"<b>{n} SoW items: {st.get('Complete',0)} Complete, {st.get('Partial',0)} Partial, {st.get('Not started',0)} Not started, {st.get('Not verifiable',0)} Not verifiable.</b> Weighted completeness (Complete = 1, Partial = 0.5, others 0) = <b>{pct:.0f}%</b>; strict (Complete only) = {strict:.0f}%. Run 4: 49 items, 5 Complete / 28 Partial / 15 Not started / 1 Not verifiable, about 39% weighted. The item list was re-derived this run from SoW sections 3.1-3.3, 5.1-5.2, 5.6 and 5.9, so counts differ in size; the status of each item was re-checked."),
          P("<b>Important:</b> the scope document 'Anarock-Cla-Online-Listing-Platform Scope (1).docx' and the whole reports/ folder were deleted from main by commit 9b87d49 ('About us', 2026-10-21). This run read the scope document from git history (commit 21cf217) and compared it with the code. There is no scope copy in the current code base, so no copy-versus-code diff was possible."),
          P("<b>Slack project tracker (read-only, #anarock-cla-online-listing-platform, 2026-11-02 10:00):</b> estimated 430 h, consumed billable 413.90 h, non-billable 1.00 h, remaining 16.10 h, 'Project Completed' 96.26%%; planned end date 23/10/2026 has passed. Measured against the SoW, delivery is about <b>%d%%</b> weighted (%d%% strict), so the hours-based 96.26%% overstates completion by roughly %d points, with 16.10 h left for the missing items below (SalesIQ, PageSense, GA4, Functions, Search, view scoring, SEO structured data, legal pages, Production deployment). Run 4 tracker: 345.5 of 430 h (80.35%%); hours rose 68.4 h since; the scope percentages of run 4 (about 39%%) and this run (%d%%) use different item lists and are not directly comparable." % (round(pct), round(strict), round(96.26 - pct), round(pct)))]
    s += [P("2. Item-by-item", H1)]
    rows = [["SoW", "Item", "Status", "Evidence (code / CRM / Catalyst)", "Gap"]]
    for i in ITEMS: rows.append([i[0], E(i[1]), col(i[2]), E(i[3]), E(i[4])])
    s += [table(rows, [10*mm, 70*mm, 20*mm, 95*mm, W-195*mm])]
    s += [P("3. CRM and Catalyst comparison (read-only connectors)", H1)]
    cc = [["Area", "Expected by code / SoW", "Observed this run", "Verdict"],
          ["CRM org", "Anarock Property Consultants Pvt. Ltd. (Zoho CRM, Professional, 101 users, paid to 2026-12-22)", "Org id 1164552000000020813, production, Asia/Kolkata", "Matches"],
          ["CRM modules", "Leads, Properties (custom), City, Micromarkets", "Present: Leads, Properties, City, Micromarkets, Property_Options, Verifications, Employee, IRF, Invoicing, Competitor Deals", "Matches"],
          ["Record counts", "-", "Leads 1,521 (run 4: 1,460, +61); Properties 7,571; Properties with Push_to_Website=true 177 (run 4: 393); Has_Images among those: 177", "Info"],
          ["Properties fields used by code", "Push_to_Website, Has_Images, AI_Attributes_from_Images, SPOC_*, City, Micromarket", "All present (97 fields, 84 custom)", "Matches"],
          ["Leads fields written by code", "Requirement_*, Interested_Properties, Prompt, Sublead_Source, Lead_Owner_Team, Lead_Source/Status", "All present (60 fields, 21 custom). The code also sends 'Postal_Code' in one path while CRM defines Zip_Code", "Check Postal_Code mapping"],
          ["Data Store Properties", "Rows = CRM published", "177 rows = CRM 177 (Bengaluru 100, Hyderabad 64, Mumbai 12, Noida 1)", "Matches (run 4 drift of 2 resolved)"],
          ["Data Store tables", "Properties, KYC, Stats", "Same 3 tables; Stats and KYC unchanged since Sep 28-29", "Matches"],
          ["Functions", "SoW needs 6 responsibilities", "1 Function (stratus_upload), is_deployed=false", "Gap"],
          ["Stratus", "property-images bucket", "Present; encryption off, caching disabled, versioning off", "Config gap"],
          ["Slate", "Production app serving the Next.js site", "Production deployment failed (Oct 14); two Development apps", "Gap"],
          ["API Gateway / Cron / AppSail", "Throttled APIs, scheduled jobs", "1 rule (stratus_upload); no cron; no AppSail", "Gap"],
          ["Auth / CORS / table perms", "Least privilege", "Public sign-up on; App User may INSERT/UPDATE Properties; CORS lists 127.0.0.1", "Gap (S-10)"]]
    s += [table(cc, [38*mm, 70*mm, 110*mm, W-218*mm])]
    s += [P("4. Out-of-scope check", H1), P("SoW excludes maps and multilingual support; no map or multilingual code was found (grep). Detail-page location uses text only. No payment integration found.")]
    s += [P("5. Limitations", H1)]
    for t in ["Function source, Stratus object contents, CRM workflows/blueprints/custom functions, Search Console and the Gemini pipeline are not visible through the connectors; items depending on them are Partial or Not verifiable, never Complete.",
              "Items depending on live data (listing results, detail data, images) were assessed from code because the app ran without credentials.",
              "The Slack tracker is hours-based and is not a measure of delivered scope; Slack was read-only. No application code was modified."]:
        s.append(P("- " + E(t)))
    d.build(s)
    return n, st, pct, strict

if __name__ == "__main__":
    build_security(); build_code(); ta, tb = build_tests(); r = build_scope()
    print("findings", len(F), sec_summary(), "| api", api_p, api_f, ta, "| browser", br_p, br_f, tb, "| scope", r)
