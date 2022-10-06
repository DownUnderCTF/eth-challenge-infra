#!/bin/sh

# Update Blocktime of Genesis Block by env var or set default
defaultBlockTime=3
blocktime="${BLOCK_TIME:-${defaultBlockTime}}"
jq --arg blocktime $blocktime '.config.clique.period = ($blocktime | tonumber)' /config/ductf.json > /tmp/ductf.json

# If geth data doesn't already exist then generate with configured gen 
if ! [ -d "/data/geth" ]; then
  geth init --datadir=/data /tmp/ductf.json
  cp /config/keystore/* /data/keystore/
fi


networkid=$(cat /config/ductf.json | jq '.config.chainId')

exec geth \
--datadir=/data \
--allow-insecure-unlock \
--networkid="$networkid" \
--nodiscover \
--mine \
--password="/run/secrets/sealer_password" \
--unlock="0" \
--http \
--http.api=eth,web3,net \
--http.addr=0.0.0.0 \
--http.port=8545 \
--http.corsdomain='*' \
--http.vhosts='*'