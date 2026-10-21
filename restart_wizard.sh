#!/bin/zsh
# Restart the local wizard server with the CURRENT gateway proxy env.
# Called manually and by the 15-minute watchdog automation.
set -u
DIR="/Users/priskenlo/.openclaw/workspace/main/sales-kits/trends-review"
cd "$DIR" || exit 1
lsof -nP -iTCP:8899 -sTCP:LISTEN -t 2>/dev/null | xargs -r kill 2>/dev/null
sleep 1
nohup node serve_wizard.mjs >> /tmp/wizard-server.log 2>&1 &
sleep 3
curl -s --max-time 5 --noproxy '*' http://127.0.0.1:8899/api/health || echo "health check failed"
echo
