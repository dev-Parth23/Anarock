# Anarock CLA Online Listing Platform: Weekly FusionHawk assessment (scheduled-run instructions, v2)

Paste this whole document into the routine's prompt. Changes from v1 are marked **[NEW]** or **[CHANGED]**.

## Ground rules

- This is a testing and reporting job only. Never modify application code. The only repo changes allowed are `README.md`, the `reports/` folder and `reports/evidence/`.
- Every finding must be backed by something actually run or read. State how it was verified (code read, executed test, scan, CRM query, Catalyst query). Never claim a check was done if it wasn't.
- Highlight anything that is missing or fails, including things beyond the SoW (absent Catalyst Functions, tests, CI, `.env.example`, security headers, legal pages, monitoring, docs).
- State every limitation or technical block (no credentials, permission denials, disconnected tools, features that don't exist yet) in the reports.
- Never write to production CRM or production Catalyst. Run the app locally with no Zoho or Catalyst credentials. Use only read-only CRM and Catalyst calls.
- **[NEW] Connectors:** use the **anarock CLA Catalyst** connector to read the Catalyst configuration and code needed for the tests (Functions, Data Store tables, Stratus buckets, AppSail/Slate config, environment variable names but never values). Use the **AnarockCRM** connector for CRM. If a connector is not enabled in the session (`ListConnectors` shows `enabledInChat: false` or no tools load), say so in every report, mark the dependent checks "Not verifiable", and send a notification that the run could not complete fully.
- **[NEW] Branch rule:** always commit reports, evidence, scripts, PDFs and README to the **main** branch. Never create or push any other branch. If the session or a hook asks for a different branch, still push to main only; if it cannot be done, report that instead of creating a branch.
- **[NEW] Every run is complete:** carry out every activity needed for the tests on every run. Do not reuse earlier results, do not skip steps because the code has not changed, and do not ship a partial update page on top of an old report. Regenerate all four PDFs from fresh results every time.

## Steps

0. **[NEW] Clean the sandbox first.** Before anything else, remove all previous working state: any prior clone, `node_modules`, `.next`, test output, scratch folders, background servers (`pkill -f "next dev"`), and downloaded scanner/test tooling. Start from an empty working directory. Log what was removed in `reports/evidence/00_clean.log`.
1. Clone/pull https://github.com/fusionhawk/Anarock (**main**) fresh into the clean sandbox. Log the command and result in `reports/evidence/`.
2. Fetch the scope document from Slack and compare it with the repo code copy.
3. Use the AnarockCRM connector, read-only, to inspect the org, modules, Leads and Properties fields, record counts and sample data. Compare these with what the code reads and writes. Save the evidence.
4. **[NEW]** Use the anarock CLA Catalyst connector, read-only, to list and read the Catalyst configuration and code the tests depend on (Functions, Data Store tables and columns, Stratus buckets, AppSail/Slate, API Gateway rules, environment variable names, deployed vs repo code). Compare with what the repo code expects and with the SoW. Save the evidence.
5. Update `README.md` to match the current code and push it to main.
6. Security assessment (OWASP Top 10 2021, API Security Top 10 2023, ASVS L2). Map every finding to category, CWE and CVSS score.
   - Run `npm audit`, Semgrep with the OWASP rule packs (prove the scanner works on a known-bad sample), a secret scan of the working tree and full git history, GitHub secret scanning, and **[CHANGED]** an OWASP ZAP baseline scan against the local app **only if ZAP can be installed and run in the sandbox**. If it cannot be installed after a genuine attempt (log the attempt), **remove ZAP from the plan and from the reports** rather than listing it as a gap; do not carry it forward as "not run" every week. The same rule applies to any other tool that cannot be installed.
   - Run scripted request tests for headers, validation, rate-limit bypass, error leakage, CORS and body-size limits.
   - Include a table of which controls were tested and which could not be.
7. Code review: run lint, build and a clean install (`npm ci`) in the clean sandbox. Review all active code against the OWASP Code Review Guide, ISO 25010 and CWE. Include a register of missing items (functions, tests, CI, docs, config, monitoring, legal pages) and the accessibility results (axe, WCAG 2.1 AA).
8. Test scenarios: execute the scripted HTTP tests and the Playwright browser tests (desktop and 375px) and record pass/fail. List the designed scenarios that were blocked, and why. Keep `run_api_tests.sh` and `run_browser_tests.js` updated in `reports/evidence/`. Pin tool versions (axe-core, playwright-core) so results are comparable week to week, and note any network block (for example external APIs blocked by the sandbox proxy) as an environmental cause, not an app failure.
9. Scope Completeness report: check every SoW item against the code, the CRM **and Catalyst**, with status Complete, Partial, Not started or Not verifiable. Include evidence, the gap, an overall completeness count, and a comparison with the Slack project-tracker hours.
10. Generate all four PDFs with the FusionHawk logo (https://www.fusionhawk.io/Artboard%201-3x.png) embedded, each with the date suffix: Security, Code Review, Test Scenarios, Scope Completeness. Each PDF must be a full report built from this run's results.
11. Commit the PDFs, the `reports/evidence/` logs and the scripts to the `reports/` folder on **main**, and push to main.
12. Slack posting: the scheduled run posts the four PDFs to #anarock-cla-online-listing-platform (C0BL4L42QSK) with a short summary of the key findings. A manual run does not post to Slack. It shares the outputs in the session and waits for explicit confirmation before posting anything.
13. Send a push notification only if there are new or high-severity findings, or if the run could not complete (including a required connector being unavailable).
