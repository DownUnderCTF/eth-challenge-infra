FROM ethereum/client-go:v1.11.5

RUN apk add --no-cache jq

COPY entrypoint.sh /entrypoint.sh
COPY genesis.json.template /config/genesis.json.template
RUN chmod +x /entrypoint.sh

EXPOSE 8545

ENTRYPOINT ["/entrypoint.sh"]