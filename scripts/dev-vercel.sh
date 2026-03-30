#!/usr/bin/env zsh

set -a
source .env.local
set +a

PORT_TO_USE="${DEV_PORT:-4310}"

if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$PORT_TO_USE" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port ${PORT_TO_USE} is already in use. Stop the existing process before running pnpm dev."
  exit 1
fi

export PORT="$PORT_TO_USE"
export VITE_DEV_SERVER_PORT="$PORT_TO_USE"

exec npx vercel dev --listen "$PORT_TO_USE"
