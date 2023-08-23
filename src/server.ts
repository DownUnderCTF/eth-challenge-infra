import fastify from "fastify";
import * as strings from "./strings";
import ChallengeRoute from "./routes/challenge";
import path from "path";

export const init = async () => {
  const server = fastify({
    logger: {
      level: "info",
    },
  });

  server.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      return reply.status(400).send({ error: error.message });
    } else if (error.statusCode == 429) {
      return reply.send(error);
    }
    console.log(error.code);
    request.log.error(error);

    reply.status(500).send({
      error: strings.ERROR_INTERNAL_SERVER_ERROR,
      trace: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  });

  server.register(import("@fastify/rate-limit"), {
    global: false,
    timeWindow: "1 minute",
  });

  server.register(import("@fastify/static"), {
    root: path.join(__dirname, "../static"),
  });

  server.get("/", (req, res) => {
    res.sendFile("index.html");
  });

  server.register(ChallengeRoute, { prefix: "/challenge" });

  return server;
};
