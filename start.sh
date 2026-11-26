#!/usr/bin/env bash
# Starts CreatorOS in one terminal: the API, the agent worker and the dashboard.
# Press Ctrl+C once to stop all three.
set -u
cd "$(dirname "$0")"

cleanup() {
  trap - INT EXIT
  trap '' TERM          # this script survives the stop signal below; everything it started does not
  echo; echo "Stopping CreatorOS…"
  kill -TERM 0 2>/dev/null
  wait 2>/dev/null
  echo "Stopped."
  exit 0
}
trap cleanup INT TERM EXIT

echo "Starting CreatorOS (API, worker, dashboard)…"
pnpm api &
pnpm worker &
pnpm web &   # builds the dashboard first (about a minute), then serves it

# Tell the owner when the dashboard is ready.
( until curl -s -o /dev/null http://localhost:3000/login; do sleep 2; done
  echo; echo "✅ CreatorOS is ready: open http://localhost:3000   (Ctrl+C here stops everything)"; echo ) &

wait
