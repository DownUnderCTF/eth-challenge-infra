import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { ChallengeManager } from "../challenge-manager/challenge-manager";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    challengeManager: ChallengeManager;
  }
}
const challengeManagePlugin: FastifyPluginCallback = (
  fastify: FastifyInstance,
  opt,
  done
) => {
  const challengeManager = new ChallengeManager();

  fastify.decorate("challengeManager", challengeManager);
  done();
};

export default fp(challengeManagePlugin);
