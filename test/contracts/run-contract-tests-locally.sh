#!/bin/bash

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
compose_file="${script_dir}/../../.cicd/contract.docker-compose.yml"


# Check if OPENAI_API_KEY is set
if [[ -z "${OPENAI_API_KEY}" ]]; then
  echo "OPENAI_API_KEY environment variable is not set. Run \`export OPENAI_API_KEY=XXXXX\` before continuing."
  exit 1
fi

docker compose -f "${compose_file}" up database storage api newman --build --exit-code-from newman
docker compose -f "${compose_file}" down


