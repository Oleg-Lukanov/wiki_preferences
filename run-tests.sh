#!/usr/bin/env bash
set -euo pipefail

# Load .env so credentials are available to docker-compose
if [ -f .env ]; then
  # Export each non-comment, non-empty line as an env variable
  set -o allexport
  source .env
  set +o allexport
fi

echo "Building Docker image and running tests..."
docker compose up --build --abort-on-container-exit

echo ""
echo "Done. HTML report is available at: $(pwd)/playwright-report/index.html"
