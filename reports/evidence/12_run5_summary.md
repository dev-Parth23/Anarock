# Run 5 summary - 2026-11-02 (full re-execution from empty sandbox; no results reused)
Tools: node 22.23.4, npm 10.9.9, next 14.2.5, semgrep 1.183.0, ZAP 2.16.1, playwright-core 1.56.1, axe-core 4.10.2, curl 8.5.0.
Connectors: AnarockCRM and anarock CLA Catalyst enabled and used read-only; Slack read-only for tracker; GitHub secret scanning unavailable (no Advanced Security).
Results: npm ci PASS; npm audit 19 (1C/14H/4M); lint 0 errors/9 warnings; build PASS; Semgrep 0 (canary 3); secrets 0 (86 commits, regex); ZAP 8 alert types; API 64/107 pass; browser 82/112 pass.
Security: 18 findings, 0 critical, 4 high, 10 medium, 4 low. Scope: 46 items, 2 Complete, 28 Partial, 13 Not started, 3 Not verifiable (~35% weighted). Slack tracker 413.90/430 h (96.26%).
