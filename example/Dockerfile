FROM ghcr.io/downunderctf/eth-challenge-base/eth-challenge:latest

WORKDIR /app

COPY challenge.yaml challenge.yaml
COPY contracts/ contracts/
# Contract builds output to be in a flat dir
COPY build/contracts output/

ENV CONTRACT_ABI_DIR=/app/output


