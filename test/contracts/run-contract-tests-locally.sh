#!/bin/bash

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
compose_file="${script_dir}/contract.docker-compose.yml"

# Check if OPENAI_API_KEY is set
if [[ -z "${OPENAI_API_KEY}" ]]; then
  echo "OPENAI_API_KEY environment variable is not set. Run \`export OPENAI_API_KEY=XXXXX\` before continuing."
  exit 1
fi

CONTRACT_TYPE=blueprint     OPENAI_API_KEY=$OPENAI_API_KEY docker compose -f ./test/contracts/contract.docker-compose.yml up --exit-code-from newman --build --force-recreate
CONTRACT_TYPE=blueprint docker compose -f ./test/contracts/contract.docker-compose.yml down --volumes

# CONTRACT_TYPE=plugin-loader OPENAI_API_KEY=$OPENAI_API_KEY docker compose -f ./test/contracts/contract.docker-compose.yml up --exit-code-from newman
# docker compose -f ./test/contracts/contract.docker-compose.yml down --volumes

# CONTRACT_TYPE=raw-parser    OPENAI_API_KEY=$OPENAI_API_KEY docker compose -f ./test/contracts/contract.docker-compose.yml up --exit-code-from newman
# docker compose -f ./test/contracts/contract.docker-compose.yml down --volumes