FROM ethereum/client-go:stable

RUN apk add --no-cache jq

COPY entrypoint.sh /entrypoint.sh
COPY config/ /config
RUN chmod +x /entrypoint.sh

EXPOSE 8545

ENTRYPOINT ["/entrypoint.sh"]