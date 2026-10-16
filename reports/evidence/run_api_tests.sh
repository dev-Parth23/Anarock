#!/usr/bin/env bash
# FusionHawk API/runtime test runner for the Anarock app. Targets a LOCAL dev server started WITHOUT Zoho/Catalyst credentials,
# so no request can reach production CRM. Usage: run_api_tests.sh http://localhost:3111
B=${1:-http://localhost:3111}
case "$B" in http://localhost:*|http://127.0.0.1:*) ;; *) echo "Refusing: target must be a local dev server"; exit 2;; esac
if [ "$CONFIRM_NO_CRM_CREDS" != "1" ]; then echo "SAFETY: some tests send lead payloads that pass validation. Start the app WITHOUT ZOHO_*/CATALYST_* env vars (so nothing reaches CRM) and re-run with CONFIRM_NO_CRM_CREDS=1"; exit 2; fi
 PASS=0; FAIL=0; J='Content-Type: application/json'
chk(){ # id, description, expected, actual
  if [ "$3" = "$4" ]; then PASS=$((PASS+1)); printf "PASS  %-6s %-72s expected=%s actual=%s\n" "$1" "$2" "$3" "$4"
  else FAIL=$((FAIL+1)); printf "FAIL  %-6s %-72s expected=%s actual=%s\n" "$1" "$2" "$3" "$4"; fi; }
N=0
code(){ # each lead-endpoint request gets a unique client IP unless the test sets its own, so the rate limiter does not mask other results
  local extra=""; case "$*" in *"/api/lead"*) case "$*" in *X-Forwarded-For*) ;; *) N=$((N+1)); extra="-H X-Forwarded-For:172.20.$((N/250)).$((N%250+1))";; esac;; esac
  curl -s -o /dev/null -w "%{http_code}" $extra "$@"; }
echo "# API/runtime tests $(date -u +%FT%TZ) target=$B"
echo "## Pages & routing"
for p in / /properties /compare /shortlist /services /list-your-property /kyc/city/delhi /kyc/city/mumbai /kyc/city/bengaluru /kyc/city/pune /kyc/city/chennai /kyc/city/hyderabad /kyc/city/kolkata /kyc/city/noida /kyc/city/gurugram; do chk "PG" "GET $p" 200 "$(code $B$p)"; done
chk PG "GET /unknown-route" 404 "$(code $B/unknown-route)"
chk PG "GET /properties/abc/xyz (non-existent property) should be 404" 404 "$(code $B/properties/abc/xyz)"
echo "## SEO"
SM=$(curl -s $B/sitemap.xml); for u in $(echo "$SM" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g'); do path=$(echo "$u" | sed 's#https\?://[^/]*##'); chk "SEO" "sitemap URL resolves: $path" 200 "$(code "$B$path")"; done
chk SEO "sitemap contains property/detail URLs" yes "$(echo "$SM" | grep -q '/properties/' && echo yes || echo no)"
chk SEO "sitemap domain equals request host (NEXT_PUBLIC_BASE_URL set)" yes "$(echo "$SM" | grep -q 'localhost' && echo yes || echo no)"
RB=$(curl -s $B/robots.txt); chk SEO "robots.txt references sitemap" yes "$(echo "$RB" | grep -qi '^sitemap:' && echo yes || echo no)"
chk SEO "robots.txt disallow paths exist as routes (/wishlist)" 200 "$(code $B/wishlist)"
H=$(curl -s $B/); for t in '<title>' 'name="description"' 'rel="canonical"' 'property="og:title"' 'name="twitter:card"' 'application/ld+json'; do chk SEO "home has $t" yes "$(echo "$H" | grep -q "$t" && echo yes || echo no)"; done
chk SEO "/properties HTML is server-rendered with listings (not 'Loading properties')" yes "$(curl -s $B/properties | grep -q 'Loading properties' && echo no || echo yes)"
PD=$(curl -s $B/properties/1/test-property); HOMEDESC=$(echo "$H" | grep -o 'name="description" content="[^"]*"'); PDESC=$(echo "$PD" | grep -o 'name="description" content="[^"]*"')
chk SEO "property detail has its own meta description (differs from home)" yes "$([ "$HOMEDESC" != "$PDESC" ] && echo yes || echo no)"
chk SEO "property detail JSON-LD is a listing type (RealEstateListing/Product/Offer)" yes "$(echo "$PD" | grep -Eq 'RealEstateListing|"Offer"|"Product"' && echo yes || echo no)"
for p in /properties /properties/1/test-property /services /kyc/city/delhi /list-your-property; do c=$(curl -s $B$p | grep -o '<link rel="canonical" href="[^"]*"' | sed 's/.*href="//;s/"//'); chk SEO "canonical of $p points to itself (not homepage)" yes "$(echo "$c" | grep -q "$p\$" && echo yes || echo no)"; echo "      canonical=$c"; done
echo "## Security headers (GET /)"
HD=$(curl -sI $B/); for h in content-security-policy strict-transport-security x-frame-options x-content-type-options referrer-policy permissions-policy; do chk HDR "header present: $h" yes "$(echo "$HD" | grep -qi "^$h:" && echo yes || echo no)"; done
chk HDR "X-Powered-By not exposed" yes "$(echo "$HD" | grep -qi '^x-powered-by' && echo no || echo yes)"
echo "## Injection / reflection"
T=$(curl -s "$B/properties/1/%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E" | grep -o '<title>[^<]*</title>'); chk XSS "slug with HTML is escaped in <title>" yes "$(echo "$T" | grep -q '<img' && echo no || echo yes)"; echo "      title rendered: $T"
chk XSS "/api/wishlist reflects sessionId only as JSON" application/json "$(curl -s -D- -o /dev/null "$B/api/wishlist?sessionId=%3Cscript%3E" | grep -i '^content-type' | sed 's/;.*//;s/content-type: //I' | tr -d '\r')"
echo "## /api/leads (validation) - invalid inputs only"
chk LEAD "missing name" 400 "$(code -X POST $B/api/leads -H "$J" -d '{"name":"","phone":"9999999999"}')"
chk LEAD "invalid phone" 400 "$(code -X POST $B/api/leads -H "$J" -d '{"name":"T","phone":"abc"}')"
chk LEAD "invalid email" 400 "$(code -X POST $B/api/leads -H "$J" -d '{"name":"T","phone":"9999999999","email":"bad"}')"
chk LEAD "wrong content-type" 415 "$(code -X POST $B/api/leads -H 'Content-Type: text/plain' -d x)"
chk LEAD "malformed JSON should be 400" 400 "$(code -X POST $B/api/leads -H "$J" -d '{bad')"
chk LEAD "first name > 80 chars rejected" 400 "$(code -X POST $B/api/leads -H "$J" -d "{\"firstName\":\"$(printf 'A%.0s' $(seq 1 100))\",\"phone\":\"9999999999\"}")"
python3 -c "print('{\"name\":\"\",\"phone\":\"9\",\"x\":\"'+'A'*60000+'\"}')" > /tmp/big60k.json
python3 -c "print('{\"name\":\"QA Probe\",\"phone\":\"9999999999\",\"requirementDetails\":\"'+'A'*60000+'\"}')" > /tmp/big60k_valid.json
chk LEAD "60KB body with Content-Length rejected" 413 "$(code -X POST $B/api/leads -H "$J" -H 'X-Forwarded-For: 10.50.0.1' --data-binary @/tmp/big60k.json)"
chk LEAD "60KB chunked body (no Content-Length) should still be rejected" 413 "$(code -X POST $B/api/leads -H "$J" -H 'X-Forwarded-For: 10.50.0.2' -H 'Transfer-Encoding: chunked' --data-binary @/tmp/big60k.json)"
chk LEAD "honeypot returns 200 (silent) without CRM call" 200 "$(code -X POST $B/api/leads -H "$J" -d '{"website":"http://x","name":"bot"}')"
chk LEAD "DELETE not allowed" 405 "$(code -X DELETE $B/api/leads)"
echo "## /api/lead2 and /api/lead3 (same abuse inputs)"
chk LEAD2 "invalid phone/email rejected with 400 (lead2)" 400 "$(code -X POST $B/api/lead2 -H "$J" -H 'X-Forwarded-For: 10.51.0.1' -d '{"name":"QA Probe","phone":"not-a-phone","email":"notanemail"}')"
chk LEAD2 "text/plain rejected with 415 (lead2)" 415 "$(code -X POST $B/api/lead2 -H 'Content-Type: text/plain' -H 'X-Forwarded-For: 10.51.0.2' -d '{"name":"QA Probe","phone":"123"}')"
chk LEAD2 "60KB body (valid name/phone) rejected with 413 (lead2)" 413 "$(code -X POST $B/api/lead2 -H "$J" -H 'X-Forwarded-For: 10.51.0.3' --data-binary @/tmp/big60k_valid.json)"
chk LEAD "60KB body (valid name/phone) rejected with 413 (/api/leads, control)" 413 "$(code -X POST $B/api/leads -H "$J" -H 'X-Forwarded-For: 10.51.0.5' --data-binary @/tmp/big60k_valid.json)"
chk LEAD2 "cross-origin text/plain POST (no CORS preflight) rejected" 415 "$(code -X POST $B/api/lead2 -H 'Origin: https://evil.example' -H 'Content-Type: text/plain' -H 'X-Forwarded-For: 10.51.0.4' -d '{"name":"QA Probe","phone":"123"}')"
chk LEAD3 "invalid phone rejected (lead3)" 400 "$(code -X POST $B/api/lead3 -H "$J" -H 'X-Forwarded-For: 10.52.0.1' -d '{"name":"T","phone":"abc","selectedProperties":[{"id":"1"}]}')"
echo "## Rate limiting (10 req/min expected)"
burst(){ local ep=$1 ip=$2 n=$3 mode=$4 out=""; for i in $(seq 1 $n); do x=$ip; [ "$mode" = rot ] && x="10.${ip}.$i.9"; out="$out$(code -X POST $B$ep -H "$J" -H "X-Forwarded-For: $x" -d '{"name":"","phone":"9"}') "; done; echo "$out"; }
r=$(burst /api/leads 60 12 same); chk RATE "/api/leads same client: 11th request is 429" 429 "$(echo $r | awk '{print $11}')"; echo "      $r"
r=$(burst /api/leads 61 12 rot);  chk RATE "/api/leads rotating X-Forwarded-For still limited" yes "$(echo $r | grep -q 429 && echo yes || echo no)"; echo "      $r"
r=$(burst /api/lead3 62 12 same); chk RATE "/api/lead3 same client: 11th request is 429" 429 "$(echo $r | awk '{print $11}')"; echo "      $r"
r=$(burst /api/lead3 63 12 rot);  chk RATE "/api/lead3 rotating X-Forwarded-For still limited" yes "$(echo $r | grep -q 429 && echo yes || echo no)"; echo "      $r"
r=$(burst /api/lead2 64 15 same); chk RATE "/api/lead2 same client: limited" yes "$(echo $r | grep -q 429 && echo yes || echo no)"; echo "      $r"
echo "## Other APIs"
chk API "exchange-rates 200" 200 "$(code $B/api/exchange-rates)"
chk API "exchange-rates has INR,AED,USD,EUR,SGD" yes "$(curl -s $B/api/exchange-rates | python3 -c "import sys,json;r=json.load(sys.stdin)['rates'];print('yes' if all(k in r for k in ['INR','AED','USD','EUR','SGD']) else 'no')")"
chk API "kyc without city -> 400" 400 "$(code $B/api/kyc)"
chk API "wishlist without sessionId -> 400" 400 "$(code $B/api/wishlist)"
chk API "location lat out of range -> 400" 400 "$(code -X POST $B/api/location -H "$J" -d '{"latitude":999,"longitude":1}')"
chk API "location malformed JSON -> 400" 400 "$(code -X POST $B/api/location -H "$J" -d 'notjson')"
chk API "location valid coordinates (New Delhi) -> success:true city" yes "$(curl -s -X POST $B/api/location -H "$J" -d '{"latitude":28.6139,"longitude":77.2090}' | python3 -c "import sys,json;d=json.load(sys.stdin);print('yes' if d.get('success') and d['location'].get('city') else 'no')")"
chk API "micromarkets upstream failure is not reported as success" no "$(curl -s $B/api/micromarkets | python3 -c "import sys,json;print('yes' if json.load(sys.stdin).get('success') else 'no')")"
chk API "/api/properties error body must not disclose env var names" no "$(curl -s $B/api/properties | grep -q 'CATALYST_' && echo yes || echo no)"
chk API "/api/cities error body must not disclose env var names" no "$(curl -s $B/api/cities | grep -q 'ZOHO_' && echo yes || echo no)"
echo; echo "# SUMMARY: PASS=$PASS FAIL=$FAIL TOTAL=$((PASS+FAIL))"
