#!/usr/bin/env zsh

set -a
source .env.local
set +a

exec npx vercel dev
