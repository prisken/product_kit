#!/bin/zsh
# Watchdog: restart the wizard server when the gateway's egress proxy has rotated.
# The server snapshots HTTPS_PROXY at boot; after a gateway restart that port/credential
# changes and every outbound call fails with "CONNECT tunnel failed, response 407".
set -u
DIR="/Users/priskenlo/.openclaw/workspace/main/sales-kits/trends-review"

cur=$(python3 -c 'import os,re;m=re.search(r":(\d+)",os.environ.get("HTTPS_PROXY") or os.environ.get("HTTP_PROXY") or "");print(m.group(1) if m else "")')
health=$(curl -s --max-time 5 --noproxy '*' http://127.0.0.1:8899/api/health 2>/dev/null || echo '')
port=$(printf '%s' "$health" | python3 -c 'import sys,json
try:
    print(json.load(sys.stdin).get("proxyPort",""))
except Exception:
    print("")' 2>/dev/null)

if [ -z "$port" ]; then
  echo "server not answering - restarting"
  "$DIR/restart_wizard.sh"
  exit 0
fi

if [ -n "$cur" ] && [ "$port" != "$cur" ]; then
  echo "proxy rotated ($port -> $cur) - restarting wizard server"
  "$DIR/restart_wizard.sh"
  exit 0
fi

echo "ok: proxy $cur, server up"
