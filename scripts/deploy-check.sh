#!/usr/bin/env bash
set -euo pipefail

API_BASE="${1:-https://api.ain90.online}"
echo "Checking API base: $API_BASE"
echo "--- /health"
curl -s "$API_BASE/health" | jq . || curl -s "$API_BASE/health"
echo "--- /api-docs (status)"
curl -s -o /dev/null -w "%{http_code}\n" "$API_BASE/api-docs"


