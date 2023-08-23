import { Contract, ContractFactory, Wallet, ethers } from "ethers";
import { ContractABI } from "../../models/contract.model";
import {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import { Deferrable } from "ethers/lib/utils";

/**
 * Deployer class handles all deployments of new contracts, uses a deployer
 * wallet for transactions which is set in the contructor.
 */
export class Deployer {
  private readonly _contractABIDir: string;
  private readonly _deployerWallet: Wallet;

  constructor(
    deployerPrivateKey: string,
    provider: Provider,
    _contractABIDir: string
  ) {
    this._deployerWallet = new ethers.Wallet(deployerPrivateKey, provider);
    this._contractABIDir = _contractABIDir;
  }

  /**
   * Deploys a new contract from the solidity compiled .json file
   *
   * @param contractName - The name of the contract to deploy. This should match the .sol file
   * @param args - Any deployment arguments to deploy with the contract
   * @param options - Provide custom options for when deploying the contract.
   * @returns The [Contract]
   */
  async deployContract(
    contractName: string,
    args: unknown[] = [],
    options: ContractDeployOptions = {}
  ): Promise<Contract> {
    const relativePath = options.customPath
      ? `${this._contractABIDir}/${options.customPath}`
      : `${this._contractABIDir}/${contractName}.json`;

    const contractABI = new ContractABI(relativePath);

    console.log(`Deploying new contract called ${contractName}`);
    const contract = await this.deployContractFromABI(
      contractABI,
      args,
      options.waitForMine
    );
    console.log(
      `Successfully deployed contract ${contractName} at address: ${contract.address}`
    );
    return contract;
  }

  /**
   * Deploys a contract through direct bytecode instead of using a solidity file.
   *
   * @param contractName - The name of the contract
   * @param bytecode - the bytecode of the contract in hex format
   * @returns a [DeployedContract]
   */

  async deployContractWithByteCode(
    contractName: string,
    bytecode: string
  ): Promise<Contract> {
    const deployContractTx = {
      data: bytecode,
    };

    console.log(`Deploying new contract called ${contractName}`);
    try {
      const receipt = await (
        await this.sendTransaction(deployContractTx)
      ).wait();
      console.log(
        `Successfully deployed new contract called ${contractName} at ${receipt.contractAddress}`
      );
      const contract = new Contract(receipt.contractAddress, []);
      return contract;
    } catch (e) {
      console.error(e);
      throw new Error(
        `There was an error deploying ${contractName} with bytecode`
      );
    }
  }

  private async deployContractFromABI(
    contractABI: ContractABI,
    constructorArgs: unknown[] = [],
    waitForMine = false
  ): Promise<Contract> {
    const contractFactory = ContractFactory.fromSolidity(
      contractABI.solidityData,
      this._deployerWallet
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
   * Uses the deployment wallet to send an arbritrary transaction.
   *
   * @param tx The unsigned raw transaction to send
   * @returns The [TransactionResponse]
   */
  async sendTransaction(
    tx: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse> {
    return await this._deployerWallet.sendTransaction(tx);
  }
}

type ContractDeployOptions = {
  customPath?: string;
  waitForMine?: boolean;
};
