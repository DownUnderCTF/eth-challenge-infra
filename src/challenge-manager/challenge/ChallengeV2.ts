import { Contract, ethers } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { readFileSync } from "fs";
import { backOff } from "exponential-backoff";
import {
  BLOCKCHAIN_RPC_URL,
  CONTRACT_ABI_DIR,
  CONTRACT_DIR,
  DEPLOYER_PRIVATE_KEY,
} from "../../config";
import { Deployer } from "../deployer/deployer";
import path from "path";
import { ChallengeConfig } from "../challenge-config/ChallengeConfigSchema";

/**
 * This class is the instantiation of a CTF challenge, with functions to deploy
 * challenge contracts, fund player wallets and check the status of the
 * challenge. This is the heart of the API.
 */
export class ChallengeV2 {
  private _playerWallet = ethers.Wallet.createRandom();

  // The contract that is used to deploy the contract
  // and verify if it is solved or not
  private _setupContract: Contract | undefined;
  // Contract address of the challenge
  private _challengeContractAddress: string = ethers.constants.AddressZero;
  // Maps contract name to it's source
  private _challengeContractSource: Map<string, string> = new Map();

  // Status of the challenge
  private _deployStatus = DEPLOY_STATUS.NOT_DEPLOYED;

  private readonly _config: ChallengeConfig;
  private readonly provider: Provider;
  private readonly deployer: Deployer;

  get isDeployed(): boolean {
    return this._deployStatus == DEPLOY_STATUS.DEPLOYED;
  }

  get isDeploying(): boolean {
    return this._deployStatus == DEPLOY_STATUS.DEPLOYING;
  }

  get status(): string {
    return this._deployStatus;
  }

  get playerWallet(): ethers.Wallet {
    return this._playerWallet;
  }

  get flag(): string {
    return this._config.flag;
  }

  get name(): string {
    return this._config.challengeName;
  }

  get description(): string {
    return this._config.challengeDescription;
  }

  get blockTime(): number {
    return this._config.blockTime;
  }

  get challengeContractSource(): string[] {
    const challengeContracts: string[] = [];
    this._challengeContractSource.forEach((source) => {
      challengeContracts.push(source);
    });
    return challengeContracts;
  }

  get challengeContractAddress(): string {
    return this._challengeContractAddress;
  }

  get setupContract(): Contract {
    if (this._setupContract == undefined) {
      throw new Error(
        "Attempting to read challenge addresses before setup contract deployed"
      );
    }
    return this._setupContract;
  }

  constructor(config: ChallengeConfig) {
    this.provider = ethers.getDefaultProvider(BLOCKCHAIN_RPC_URL);
    const deployerPrivateKey = DEPLOYER_PRIVATE_KEY;
    this.deployer = new Deployer(
      deployerPrivateKey,
      this.provider,
      path.resolve(process.cwd(), CONTRACT_ABI_DIR)
    );
    this._config = config;
    this.loadChallengeSource();
  }

  private loadChallengeSource() {
    this._config.challengeSourceFiles.forEach((contractName) => {
      const contractPath = path.resolve(CONTRACT_DIR, contractName);
      try {
        this._challengeContractSource.set(
          contractName,
          readFileSync(contractPath, "utf-8")
        );
      } catch (e: unknown) {
        throw Error(`unable to read file ${contractPath}`, { cause: e });
      }
    });
  }

  /**
   * Starts the setup of the challenge, by deploying the setup challenge
   * contract to the specified chain. Then calls the setup() function on the
   * contract to setup the challenge from that contract.
   *
   * Also funds the player account with the configured amount of ETH.
   */
  async setupChallenge(): Promise<void> {
    this._deployStatus = DEPLOY_STATUS.DEPLOYING;
    console.log("Starting deployment of challenge", this._config.challengeName);

    try {
      const connection = await backOff(
        async () => await this.checkConnection()
      );
      console.log(connection);
    } catch (e) {
      this._deployStatus = DEPLOY_STATUS.FAILED;
      throw new Error("Unable to connect to blockchain... dying");
    }

    console.log(`Connection established at ${BLOCKCHAIN_RPC_URL}`);

    try {
      await this.fundPlayerWalletEth(this._config.playerInitialBalance);
      await this.deployChallenge();
      await this.loadChallengeAddress();
      this._deployStatus = DEPLOY_STATUS.DEPLOYED;
    } catch (e) {
      this._deployStatus = DEPLOY_STATUS.FAILED;
      throw new Error(
        `Error deploying challenge ${this._config.challengeName}`,
        { cause: e }
      );
    }

    console.log("Finished deployment of", this._config.challengeName);
    console.log(`Player Wallet: ${this.playerWallet.address}`);
  }

  private async checkConnection(): Promise<ethers.providers.Network> {
    console.log(`Attempting to connect to RPC URL ${BLOCKCHAIN_RPC_URL} ...`);
    return await this.provider.getNetwork();
  }

  // Function that will be called upon creation of the challenge
  private async deployChallenge(): Promise<void> {
    const contractInitialValue = ethers.utils.parseEther(
      this._config.contractInitialBalance
    );
    console.log(
      `Deploying setup contract with ${this._config.contractInitialBalance} ETH`
    );

    try {
      this._setupContract = await this.deployer.deployContract(
        this._config.setupContractName,
        [
          this.playerWallet.address,
          {
            value: contractInitialValue,
          },
        ]
      );
    } catch (e: unknown) {
      throw new Error("Unable to deploy challenge contract", { cause: e });
    }
  }

  private async loadChallengeAddress() {
    console.log("Loading challenge address from deployer");

    if (this.setupContract.functions["challenge()"] === undefined) {
      throw new Error(
        "Unable to find challenge address from Setup Contract are you inheriting \
         from the base Setup.sol?"
      );
    }
    this._challengeContractAddress = await this.setupContract.challenge();
    console.log(`Challenge address: ${this._challengeContractAddress}`);
    return;
  }

  // Function that will be called to verify if the challenge state is correct or
  // not. Returns a [boolean] which will be the yes/no of the challenge.
  async isChallengeSolved(): Promise<boolean> {
    if (this._config.challengeSolveType === "function") {
      if (this.setupContract.functions["isSolved()"] === undefined) {
        throw new Error(
          "isSolved() function is not available to call on the setup contract"
        );
      }
      return await this.setupContract.isSolved();
    }

    // TODO: Implement event based checking
    if (this._config.challengeSolveType === "event") {
      // Unsupported at the moment
      throw new Error("Event checking is unimplemented");
    }

    throw new Error(
      "Invalid challenge solution type, please check your config yaml file"
    );
  }

  // Function to be called upon challenge reset.
  async resetChallenge() {
    console.log("Resetting challenge", this._config.challengeName);
    await this.setPlayerBalanceZero();
  }

  /**
   * Sets the player wallet balance close to 0 so it is unusable.
   * This is used in resetting challenges to empty existing wallets.
   *
   * If this transaction fails, don't crash just continue cause it's not the
   * end of the world or the player just doesn't have enough funds
   */
  async setPlayerBalanceZero() {
    console.log(
      `Resetting player wallet ${this.playerWallet.address} to close to 0`
    );

    try {
      const playerBalance = await this.provider.getBalance(
        this.playerWallet.address
      );
      const connectWallet = this.playerWallet.connect(this.provider);
      await connectWallet.sendTransaction({
        to: ethers.constants.AddressZero,
        value: playerBalance.sub(ethers.utils.parseEther("0.01")),
      });
    } catch (e) {
      console.warn(e);
      console.warn("There was an error emptying the player balance");
    }
  }

  /**
   * Funds the players wallet from the deployers account with the specified amount
   *
   * @param amount - Amount to fund the player wallet with in ETHER. So "1"
   * would fund 1 ether
   * @returns - The transaction response (not mined, call .wait() to wait for mine)
   */
  async fundPlayerWalletEth(
    amount: string
  ): Promise<ethers.providers.TransactionResponse> {
    console.log(`Funding player address with ${amount} ETH`);
    return await this._fundAddressEth(this._playerWallet.address, amount);
  }

  /**
   * Funds a specified address wallet from the deployers account with the specified amount
   *
   * @param address - The address to fund
   * @param amount - Amount to fund the player wallet with in ETHER. So "1"
   * would fund 1 ether
   *
   * @returns - The transaction response (not mined, call .wait() to wait for mine)
   */
  async fundAddressEth(
    address: string,
    amount: string
  ): Promise<ethers.providers.TransactionResponse> {
    return await this._fundAddressEth(address, amount);
  }

  private async _fundAddressEth(
    address: string,
    amount: string
  ): Promise<ethers.providers.TransactionResponse> {
    const tx = {
      to: address,
      value: ethers.utils.parseEther(amount),
    };
    return await this.deployer.sendTransaction(tx);
  }

  /**
   * Retrieves the players wallet balance in formatted ETH.
   *
   * @returns The formatted string in ETH of the player's balance
   */
  async getBalanceOfPlayerWalletInEth(): Promise<string> {
    return await this._getBalanceOfAddressInEth(this.playerWallet.address);
  }

  /**
   * Retrieves a balance of a wallet in formatted ETH.
   *
   * @param address - The address of the wallet that you want to check the balance of
   * @returns - The balance of the address
   */
  async getBalanceOfAddressInEth(address: string): Promise<string> {
    return await this._getBalanceOfAddressInEth(address);
  }

  private async _getBalanceOfAddressInEth(address: string): Promise<string> {
    const bal = await this.provider.getBalance(address);
    return ethers.utils.formatEther(bal);
  }
}

enum DEPLOY_STATUS {
  NOT_DEPLOYED = "NOT_DEPLOYED",
  DEPLOYING = "DEPLOYING",
  DEPLOYED = "DEPLOYED",
  FAILED = "FAILED",
}

export type SolveStatus = {
  solved: boolean;
  reason: string;
};

type ContractNameAddress = {
  contractName: string;
  address: string;
};
