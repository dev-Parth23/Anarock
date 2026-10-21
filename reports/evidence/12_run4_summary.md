# Run 4 summary - 2026-10-16 (full re-execution, no results reused)
Sandbox cleaned, main cloned fresh (HEAD fcdc286 incl. README commit; app code unchanged since b504988).
Tools: node 22.22.0, npm 10.9.4, semgrep 1.181.0, ZAP 2.16.1 (java 21), playwright-core 1.56.1, axe-core 4.10.2, reportlab 5.0.1.
Connectors: AnarockCRM and anarock CLA Catalyst both enabled and used read-only; Slack used read-only for the tracker.
Results: npm ci FAIL; npm audit 13 (1C/10H/2M); lint 1 error + 4 warnings; build FAIL; Semgrep 0 findings (canary 3); secrets 0 real hits (54 commits); GitHub secret scanning unavailable; ZAP ran (passive); API 49/84 pass; browser 86/103 pass.
New this run: ZAP now installed and run (removed from 'not run' gaps); Catalyst inspection (Production Slate deployment failed, 1 undeployed function, 3 tables, open sign-up, App User write permission); S-07 re-rated High with Data Store evidence (SPOCNumber in 152 rows); S-17 and S-18 added; /HomePage stray route; git history holds 4,118 node_modules + 787 .build files; Leads total 1,460 recorded.
Findings: 18 items - 1 critical, 3 high, 9 medium, 4 low, 1 info (severity now strictly from CVSS bands).
