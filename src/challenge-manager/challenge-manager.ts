import * as strings from "../strings";
import { ChallengeV2 } from "./challenge/ChallengeV2";
import { CONFIG_FILE_NAME, ROOT_DIR } from "../config";
import path from "path";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import { ChallengeConfig } from "./challenge-config/ChallengeConfigSchema";

/**
 * Simple Challenge Manager to manage the lifecycle of a [ChallengeV2]
 * Loads a [ChallengeConfig] from a yaml file to initialize the challenge.
 */
export class ChallengeManager {
  private _challenge!: ChallengeV2;
  private _challengeConfig: ChallengeConfig;

  constructor() {
    this._challengeConfig = this.loadChallengeConfig();
    this._challenge = new ChallengeV2(this._challengeConfig);
    this.startChallenge();
  }

  /**
   * Redeploys a new challenge and drains the player wallet
   */
  reloadChallenge() {
    try {
      this.challenge.resetChallenge();
      this._challenge = new ChallengeV2(this._challengeConfig);
      this.startChallenge();
    } catch (e: unknown) {
      throw new Error("Unable to redeploy challenge", { cause: e });
    }
  }

  private startChallenge() {
    try {
      this.challenge.setupChallenge();
    } catch (e) {
      console.error(e);
      throw new Error(strings.CHALLENGE_DEPLOYMENT_FAILED, { cause: e });
    }
  }

  private loadChallengeConfig() {
    const pathToConfigFile = path.resolve(ROOT_DIR, CONFIG_FILE_NAME);
    try {
      const configFile = readFileSync(pathToConfigFile, "utf-8");
      return this.parseChallengeConfig(configFile);
    } catch (e) {
      console.error(e);
      throw new Error(`Unable load config file ${pathToConfigFile}`);
    }
  }

  private parseChallengeConfig(configString: string) {
    try {
      return new ChallengeConfig(load(configString));
    } catch (e) {
      console.error(e);
      throw new Error("Invalid yaml file");
    }
  }

  get challenge() {
    return this._challenge;
  }
}
