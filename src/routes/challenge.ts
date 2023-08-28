import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import ChallengeManager from "../plugins/challengemanager.plugin";
import * as strings from "../strings";
import { base64 } from "ethers/lib/utils";
import { EXTERNAL_RPC_URL } from "../config";

export default async function register(fastify: FastifyInstance) {
  fastify.register(ChallengeManager);
  fastify.register(cors);

  fastify.route({
    method: "GET",
    url: "/",
    handler: handleChallenge,
  });

  fastify.route({
    method: "GET",
    url: "/solve",
    handler: handleSolve,
  });

  fastify.route({
    method: "GET",
    url: "/reset",
    config: {
      rateLimit: {
        max: 2,
        timeWindow: "1 minute",
      },
    },
    handler: handleReset,
  });

  fastify.route({
    method: "GET",
    url: "/source",
    handler: handleSource,
  });

  async function handleChallenge(request: FastifyRequest, reply: FastifyReply) {
    const challenge = fastify.challengeManager.challenge;

    const res: ChallengeDetailsReply = {
      name: challenge.name,
      description: challenge.description,
      status: challenge.status,
      blockTime: challenge.blockTime,
      rpc_url: EXTERNAL_RPC_URL,
    };

    if (challenge.isDeployed) {
      const playerBalance = await challenge.getBalanceOfPlayerWalletInEth();

      const playerWallet = challenge.playerWallet;
      res.player_wallet = {
        address: playerWallet?.address,
        private_key: playerWallet?.privateKey,
        balance: `${playerBalance} ETH`,
      };
      res.contract_address = challenge.challengeContractAddress;
    }

    reply
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send(res);
  }

  async function handleSolve(request: FastifyRequest, reply: FastifyReply) {
    const challenge = fastify.challengeManager.challenge;
    if (!challenge.isDeployed) {
      return reply
        .code(400)
        .header("Content-Type", "application/json; charset=utf-8")
        .send({
          error: strings.CHALLENGE_NOT_DEPLOYED_YET,
        });
    }

    let solveStatus = false;
    try {
      solveStatus = await challenge.isChallengeSolved();
    } catch (e) {
      console.error(e);
      return reply
        .code(500)
        .header("Content-Type", "application/json; charset=utf-8")
        .send({
          error: "Unable to determine if challenge is solved.",
        });
    }
    if (solveStatus) {
      return reply
        .code(200)
        .header("Content-Type", "application/json; charset=utf-8")
        .send({
          flag: process.env.FLAG || challenge.flag,
        });
    } else {
      return reply
        .code(400)
        .header("Content-Type", "application/json; charset=utf-8")
        .send({
          error: strings.CHALLENGE_NOT_COMPLETE,
        });
    }
  }
  async function handleReset(request: FastifyRequest, reply: FastifyReply) {
    const challenge = fastify.challengeManager.challenge;
    if (!challenge.isDeployed) {
      return reply
        .code(400)
        .header("Content-Type", "application/json; charset=utf-8")
        .send({
          error: strings.CHALLENGE_NOT_DEPLOYED_YET,
        });
    }

    fastify.challengeManager.reloadChallenge();
    return reply
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({
        message: strings.CHALLENGE_RESET,
      });
  }

  async function handleSource(request: FastifyRequest, reply: FastifyReply) {
    const challenge = fastify.challengeManager.challenge;
    const sources = challenge.challengeContractSource;
    const encodedSources = sources.map((source) =>
      base64.encode(Buffer.from(source))
    );
    return reply
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send(encodedSources);
  }
}

type ChallengeDetailsReply = {
  name: string;
  description: string;
  status: string;
  blockTime: number;
  rpc_url: string;
  player_wallet?: {
    address: string;
    private_key: string;
    balance: string;
  };
  contract_address?: string;
};
