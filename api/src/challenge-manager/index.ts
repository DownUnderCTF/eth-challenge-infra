import { Challenge } from "../challenges/Challenge";
import { EVMVaultMechanismChallenge } from "../challenges/EVMVaultMechanismChallenge";
import { SolveMeChallenge } from "../challenges/SolveMeChallenge";
import { SecretAndEphemeralChallenge } from "../challenges/SecretAndEphemeralChallenge";
import { CryptoCasinoChallenge } from "../challenges/CryptoCasinoChallenge";
import { PrivateLogChallenge } from "../challenges/PrivateLogChallenge";

import * as strings from "../strings";

enum Challenges {
    SOLVE_ME = "SolveMe",
    TRUSTER = "Truster",
    SECRET_AND_EPHEMERAL = "SecretAndEphemeral",
    EVM_VAULT_MECHANISM = "EVMVaultMechanism",
    CRYPTO_CASINO = "CryptoCasino",
    PRIVATE_LOG = "PrivateLog"
}

/**
 * Simple Challenge Manager to determine which [Challenge] to deploy
 * Based off environment variables
 */
export class ChallengeManager {
  private _challenge!: Challenge;

  constructor() {
    this.loadChallenge();
    this.startChallenge();
  }

  reloadChallenge() {
    this._challenge.resetChallenge();
    this.loadChallenge();
    this.startChallenge();
  }

  private startChallenge() {
    try {
      this.challenge.setupChallenge();
    } catch(e) {
      throw new Error(strings.CHALLENGE_DEPLOYMENT_FAILED)
    }
  }

  private loadChallenge() {
    switch (process.env.CHALLENGE) {
      case Challenges.SOLVE_ME:
        this._challenge = new SolveMeChallenge();
        break;
      case Challenges.SECRET_AND_EPHEMERAL:
        this._challenge = new SecretAndEphemeralChallenge();
        break;
      case Challenges.EVM_VAULT_MECHANISM:
        this._challenge = new EVMVaultMechanismChallenge();
        break;
      case Challenges.CRYPTO_CASINO:
        this._challenge = new CryptoCasinoChallenge();
        break;
      case Challenges.PRIVATE_LOG:
        this._challenge = new PrivateLogChallenge();
        break;
      default:
        throw new Error(strings.CHALLENGE_NAME_NOT_RECOGNISED);
    }
  }


  get challenge() {
    return this._challenge;
  }
}
