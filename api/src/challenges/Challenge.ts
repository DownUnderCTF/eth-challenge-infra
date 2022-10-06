import { Contract, ContractFactory, ethers, Wallet } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import path from "path";
import { readFileSync } from 'fs';
import { ContractABI, DeployedContract } from "../models/contract.model";
import { backOff  } from "exponential-backoff";
import { BLOCKCHAIN_URL } from "../config";

/**
 * Base Challenge is an abstract class that is to be extended
 * for real challenges to be implemented
 */
export abstract class Challenge {
  readonly provider: Provider;
  readonly _deployerWallet: Wallet;

  static contractABIDir = "../../contracts/build/contracts/";

  private _isDeployed = false;
  private _isDeploying = false;

  protected _playerWallet = ethers.Wallet.createRandom();
  protected _deployedContracts: Array<DeployedContract> = [];
  protected amountToFundPlayerWallet = "1";

  // Fake flag should be overridden by env variables in prod
  readonly flag = "DUCTF{fake_flag_for_testing}"

  // Name of the main challenge contract
  // TODO: Figure out if we should change this for multi contract challenges
  abstract challengeContractName: string;
  readonly abstract challengeName: string;
  

  constructor() {
    this.provider = ethers.getDefaultProvider(BLOCKCHAIN_URL);
    const deployerPrivateKey = process.env.DEPLOYER_PRIV_KEY ||  readFileSync("/run/secrets/deployer_priv_key", "utf-8")  || "";
    this._deployerWallet = new ethers.Wallet(deployerPrivateKey, this.provider);
  }

  get isDeployed(): boolean {
    return this._isDeployed;
  }

  get isDeploying(): boolean {
    return this._isDeploying;
  }

  get playerWallet(): ethers.Wallet {
    return this._playerWallet;
  }

  get deployerWallet(): ethers.Wallet {
    return this._deployerWallet;
  }

  get deployedContracts(): DeployedContract[] {
    return this._deployedContracts;
  }

  async setupChallenge(): Promise<void> {
    this._isDeploying = true;
    console.log("Starting deployment of challenge", this.challengeName)

    try {
      const connection = await backOff(() => this.checkConnection());
      console.log(`Connection established at ${BLOCKCHAIN_URL}`);
      console.log(connection);
    } catch(e) {
      throw new Error("Unable to connect to blockchain... dying")
    }

    try {
      await this.fundPlayerWalletEth(this.amountToFundPlayerWallet);
      await this.deployChallenge();
      this._isDeployed = true;
    } catch (e) {
      console.error(e)
      throw new Error(
        `Error deploying challenge ${this.challengeContractName}`
      );
    } finally {
      this._isDeploying = false;
    }

    console.log("Finished deployment of", this.challengeName)
  }

  private checkConnection(): Promise<ethers.providers.Network> {
    console.log("Attempting to connect to blockchain...")
    return this.provider.getNetwork();
  }


  // Function that will be called upon creation of the challenge
  protected abstract deployChallenge(): Promise<void>;

  // Function that will be called to verify if the challenge state is correct or not
  // Returns a [boolean] which will be the yes/no of the challenge.
  abstract getSolvedStatus(): Promise<SolveStatus>;

  // Function to be called upon challenge reset. Should be overriden for any custom work.
  resetChallenge() {
    console.log("Resetting challenge", this.challengeName)
    this.setPlayerBalanceZero();
  }

  /**
   * Sets the player wallet balance close to 0 so it is unusable.
   * This is used in resetting challenges to empty existing wallets.
   * 
   * If this transaction fails, don't crash just continue cause it's not the 
   * end of the world or the player just doesn't have enough funds
   */
  protected async setPlayerBalanceZero() {
    console.log(`Resetting player wallet ${this.playerWallet.address} to close to 0`)
    const playerBalance = await this.provider.getBalance(this.playerWallet.address);
    const connectWallet = this.playerWallet.connect(this.provider);
    
    try {
      await connectWallet.sendTransaction({
        to: ethers.constants.AddressZero,
        value: playerBalance.sub(ethers.utils.parseEther("0.01"))
      });
    } catch (e) {
      console.warn(e);
      console.warn("There was an error emptying the player balance");
    }
  } 

  

  /**
   *
   * @param contractName - The name of the contract to deploy. This should match the .sol file
   * @param args - Any deployment arguments to deploy with the contract
   * @returns The [DeployedContract]
   */
  protected async deployContract(
    contractName: string,
    args: unknown[] = [],
    options: ContractDeployOptions = {},
  ): Promise<DeployedContract> {
    
    const relativePath = options.customPath ? `${Challenge.contractABIDir}/${options.customPath}` : `${Challenge.contractABIDir}/${contractName}.json`;

    const contractABI = new ContractABI(
      path.join(
        __dirname,
        relativePath
      )
    );

    console.log(`Deploying new contract called ${contractName}`);
    const contract = await this.deployContractFromABI(contractABI, args, options.waitForMine);

    const deployedContract: DeployedContract = {
      name: `${contractName}.sol`,
      contract,
    };
    console.log(`Successfully deployed contract ${contractName} at address: ${contract.address}`)


    this._deployedContracts.push(deployedContract);

    return deployedContract;
  }

  private async deployContractFromABI(
    contractABI: ContractABI,
    constructorArgs: unknown[] = [],
    waitForMine = false
  ) {
    const contractFactory = ContractFactory.fromSolidity(
      contractABI.solidityData,
      this.deployerWallet
    );
    try {
      const contract = await contractFactory.deploy(...constructorArgs);
      
      if (waitForMine) {
        await contract.deployTransaction.wait();
      }
      return contract;
    } catch (e) {
      console.error(e);
      throw new Error("There was an error deploying the contract.");
    }
  }

  /**
   * Deploys a contract through direct bytecode instead of using a solidity file.
   * 
   * @param contractName - The name of the contract 
   * @param bytecode - the bytecode of the contract in hex format
   * @returns a [DeployedContract] 
   */
  protected async deployContractWithByteCode(contractName: string, bytecode: string) : Promise<DeployedContract>{
    const deployContractTx = {
      data: bytecode,
    };

    console.log(`Deploying new contract called ${contractName}`)
    try {
      const receipt =  await (await this.deployerWallet.sendTransaction(deployContractTx)).wait();
      console.log(`Successfully deployed new contract called ${contractName} at ${receipt.contractAddress}`)


      const deployedChallContract: DeployedContract = {
          contract: new Contract(receipt.contractAddress, []),
          name: this.challengeContractName
      }

      this._deployedContracts.push(deployedChallContract);
      return deployedChallContract;
    } catch(e) {
      console.error(e);
      throw new Error(`There was an error deploying ${contractName} with bytecode`)
    }
  }

  /**
   * Searchs through the Challenge's [deployedContracts] for a contract
   * with a name that matchs [contractName]
   *
   * @param contractName The name of the contract you are searching for
   * @returns An instance of [ethers.Contract] which has been deployed
   */
  getDeployedContractByContractName(contractName: string): ethers.Contract {
    if (!contractName.endsWith(".sol")) {
      contractName = contractName + ".sol";
    }

    const foundContract = this._deployedContracts.find(
      (contract) => contract.name == contractName
    );
    if (foundContract !== undefined) {
      return foundContract.contract;
    } else {
      throw new Error(
        `Unable to find deployed contract with name ${contractName}`
      );
    }
  }

  /**
   * Funds the players wallet from the deployers account with the specified amount
   *
   * @param amount - Amount to fund the player wallet with in ETHER. So "1"
   * would fund 1 ether
   * @returns - The transaction response (not mined, call .wait() to wait for mine)
   */
  protected async fundPlayerWalletEth(amount: string): Promise<ethers.providers.TransactionResponse> {
    console.log(`Funding player address with ${amount} ETH`)
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
  protected async fundAddressEth(address: string, amount: string): Promise<ethers.providers.TransactionResponse> {
    return await this._fundAddressEth(address, amount);
  }

  private async _fundAddressEth(address: string, amount: string): Promise<ethers.providers.TransactionResponse> {
    const tx = {
      to: address,
      value: ethers.utils.parseEther(amount),
    };
    return await this._deployerWallet.sendTransaction(tx);
  }

  /**
   * Retrieves the players wallet balance in formatted ETH.
   * 
   * @returns The formatted string in ETH of the player's balance
   */
  async getBalanceOfPlayerWalletInEth(): Promise<string> {
    return await this.getBalanceOfAddressInEth(this.playerWallet.address);
  }

  /**
   * Retrieves a balance of a wallet in formatted ETH.
   * 
   * @param address - The address of the wallet that you want to check the balance of
   * @returns - The balance of the address
   */
  async getBalanceOfAddressInEth(address: string): Promise<string> {
    const bal = await this.provider.getBalance(address);
    return ethers.utils.formatEther(bal);
  }
}


export type SolveStatus = {
  solved: boolean;
  reason: string;
}

type ContractDeployOptions = {
  customPath?: string,
  waitForMine?: boolean,
}