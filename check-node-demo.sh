#!/usr/bin/env bash
set -euo pipefail

# Smoke test for the optional Node/Express demo.
# If app.js is not present we skip the Node checks.

if [ -f package.json ]; then
  echo "Installing npm dependencies..."
  npm ci --silent
fi

if [ ! -f app.js ]; then
  echo "SKIP: app.js not found — skipping Node demo checks"
  exit 0
fi

node app.js > /tmp/node-app.log 2>&1 &
APP_PID=$!
sleep 1.0

HTTP_STATUS=$(curl -s -o /tmp/node-index.html -w "%{http_code}" http://127.0.0.1:3000/ || true)
if [ "$HTTP_STATUS" != "200" ]; then
  echo "FAIL: expected HTTP 200 from http://127.0.0.1:3000/, got $HTTP_STATUS"
  echo "---- last 80 lines of server log ----"
  tail -n 80 /tmp/node-app.log || true
  kill $APP_PID || true
  exit 1
fi

VULN_RESPONSE=$(curl -s -X POST -d "username=alice&password=wonderland" http://127.0.0.1:3000/login-vulnerable | tr '\n' ' ')
if echo "$VULN_RESPONSE" | grep -q "Vulnerable: Login succeeded as alice"; then
  echo "PASS: vulnerable endpoint returned expected success for alice/wonderland"
else
  echo "FAIL: vulnerable endpoint didn't show expected success. Dumping response:"
  echo "$VULN_RESPONSE"
  kill $APP_PID || true
  exit 1
fi

SAFE_RESPONSE=$(curl -s -X POST -d "username=alice&password=wonderland" http://127.0.0.1:3000/login-safe | tr '\n' ' ')
if echo "$SAFE_RESPONSE" | grep -q "Safe: Login succeeded as alice"; then
  echo "PASS: safe endpoint returned expected success for alice/wonderland"
else
  echo "FAIL: safe endpoint didn't show expected success. Dumping response:"
  echo "$SAFE_RESPONSE"
  kill $APP_PID || true
  exit 1
fi

BYPASS_RESPONSE=$(curl -s -X POST -d "username=whatever&password=2+2 = 4" http://127.0.0.1:3000/login-vulnerable | tr '\n' ' ')
if echo "$BYPASS_RESPONSE" | grep -qi "Detected always-true expression"; then
  echo "PASS: vulnerable endpoint simulated bypass detection for '2+2 = 4'"
else
  echo "WARN: bypass detection not matched; response was:"
  echo "$BYPASS_RESPONSE"
fi

kill $APP_PID || true
echo "All Node demo checks passed."
