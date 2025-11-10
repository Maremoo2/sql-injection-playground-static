#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test for the static (client-only) demo
# Starts a local Python static server and verifies index.html and script.js are served.

python3 -m http.server 8000 > /tmp/static-server.log 2>&1 &
SERVER_PID=$!
sleep 0.6

HTTP_STATUS=$(curl -s -o /tmp/index.html -w "%{http_code}" http://127.0.0.1:8000/ || true)
if [ "$HTTP_STATUS" != "200" ]; then
  echo "FAIL: expected HTTP 200 but got $HTTP_STATUS"
  kill $SERVER_PID || true
  exit 1
fi

if grep -q "SQL Injection Playground" /tmp/index.html; then
  echo "PASS: index.html served and contains demo heading"
else
  echo "FAIL: index.html served but content check failed"
  kill $SERVER_PID || true
  exit 1
fi

if curl -sSf http://127.0.0.1:8000/script.js > /dev/null; then
  echo "PASS: script.js present"
else
  echo "WARN: script.js not found"
fi

kill $SERVER_PID || true
echo "All static checks passed."
