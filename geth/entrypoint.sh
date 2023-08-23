#!/bin/sh

# Modified version of https://github.com/chainflag/solidctf/blob/main/fogeth/entrypoint.sh

set -eu

DATA_DIR=/data
CHAIN_DATA_DIR=${DATA_DIR}/geth/chaindata
KEYSTORE_DIR=${DATA_DIR}/keystore

# Genesis Config
CHAIN_ID="${CHAIN_ID:-31337}"
BLOCK_TIME="${BLOCK_TIME:-0}"

mkdir -p ${DATA_DIR}
[ -f "${DATA_DIR}/deployer-address" ] && DEPLOYER_KEY=$(cat "${DATA_DIR}/deployer-address")


# Import private key if not already imported
if [ ! -d ${KEYSTORE_DIR} ]
then
echo "Importing private key"
echo -n ${DEPLOYER_PRIVATE_KEY} > ${DATA_DIR}/privatekey
echo -n ${KEY_PASSWORD:-epic} > ${DATA_DIR}/password
DEPLOYER_KEY=$(geth account import \
  --datadir=${DATA_DIR} \
  --password=${DATA_DIR}/password \
  ${DATA_DIR}/privatekey | grep -oE '[[:xdigit:]]{40}')

echo -n ${DEPLOYER_KEY} > ${DATA_DIR}/deployer-address
echo "Deployer key imported: ${DEPLOYER_KEY}"
fi

# Initialise genesis block if not already existing
if [ ! -d ${CHAIN_DATA_DIR} ]
then
  echo "Initialising Chain Data"
  # Format Genesis Block with configured ENV values
  sed "s/\${DEPLOYER}/${DEPLOYER_KEY}/g; s/\${CHAIN_ID}/${CHAIN_ID}/g; s/\${BLOCK_TIME}/${BLOCK_TIME}/g;" /config/genesis.json.template > ${DATA_DIR}/genesis.json
  geth init --datadir=${DATA_DIR} ${DATA_DIR}/genesis.json
  echo "Finished initializing Chain Data"
fi


exec geth \
--datadir=${DATA_DIR} \
--allow-insecure-unlock \
--networkid="${CHAIN_ID}" \
--nodiscover \
--mine \
--password="${DATA_DIR}/password" \
--unlock="${DEPLOYER_KEY}" \
--http \
--http.api=eth,web3,net \
--http.addr=0.0.0.0 \
--http.port=8545 \
--http.corsdomain='*' \
--http.vhosts='*' \
--miner.etherbase="${DEPLOYER_KEY}"