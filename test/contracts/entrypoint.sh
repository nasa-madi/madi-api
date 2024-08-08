#!/bin/sh

# List files
ls -la 

# Copy files
# cp -r /etc/newman/files/* /etc/newman/

node conversion.js contract.collection.json fixed.json 


# Run Newman
newman run /etc/newman/fixed.json \
  --bail \
  --env-var parserUrl=http://parser:5001 \
  --env-var storageUrl=http://storage:9023 \
  --env-var baseUrl=http://api:3030 \
  --folder ${CONTRACT_TYPE}