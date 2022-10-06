import { FastifyInstance } from "fastify";
import { ChallengeManager } from "../challenge-manager";
import * as strings from "../strings";

export default async function register(fastify: FastifyInstance) {
  
  
  const challengeManager = new ChallengeManager();

  fastify.route({
    method: "GET",
    url: "/",
    handler: async (request, reply) => {
      // Branch if challenge has been deployed
      const challenge = challengeManager.challenge;

      if (challenge.isDeployed) {
        const playerWallet = challenge.playerWallet;
        reply
          .code(200)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send({
          player_wallet: {
            address: playerWallet?.address,
            private_key: playerWallet?.privateKey,
            balance: `${await challenge.getBalanceOfPlayerWalletInEth()} ETH`
          },
          contract_address: challenge.deployedContracts.map(
            (deployedContract) => {
              return {
                address: deployedContract.contract.address,
                name: deployedContract.name,
              };
            }
          ),
        });

      // Challenge still deployed so wait. Probs wrong status code to be sending but W/E
      } else {
        reply
          .code(400)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send({
          error: strings.CHALLENGE_NOT_DEPLOYED_YET,
        });
      }
    },
  });

  // Check challenge state is solved
  fastify.route({
    method: "GET",
    url: "/solve",
    handler: async (request, reply) => {
      const challenge = challengeManager.challenge;
      if (!challenge.isDeployed) {
        return reply
          .code(400)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send({
          error: strings.CHALLENGE_NOT_DEPLOYED_YET,
        });
      }

      const solveStatus = await challenge.getSolvedStatus();
      if (solveStatus.solved) {
        return reply
          .code(200)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send({
          flag: process.env.FLAG || challenge.flag,
        });
      } else {
        return reply
          .code(200)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send({
          message: strings.CHALLENGE_NOT_COMPLETE,
          reason: solveStatus.reason
        });
      }
    },
  });

  // Reset the whole challenge
  fastify.route({
    method: "GET",
    url: "/reset",
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    },
    handler: async (request, reply) => {
      const challenge = challengeManager.challenge;
      if (!challenge.isDeployed) {
        return reply
          .code(400)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send({
          error: strings.CHALLENGE_NOT_DEPLOYED_YET,
        });
      }

      challengeManager.reloadChallenge();
      return reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({
        message: strings.CHALLENGE_RESET
      })
    }
  });

}
