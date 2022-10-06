import { BigNumber, ethers, Wallet } from "ethers";
import { generateRandomString } from "../utils";
import { Challenge, SolveStatus } from "./Challenge";


/**
 * Challenge Name: Private Log
 * Difficulty: Hard
 * Author: @BlueAlder
 */
export class PrivateLogChallenge extends Challenge {
  challengeContractName = "PrivateLog";
  readonly challengeName = "Private Log"

  initialContractBalance = ethers.utils.parseEther("100");
  amountToFundPlayerWallet = "10"
  private currentSecret = generateRandomString(30);

  private updateLogInterval = 1000 * 60;

  private runner = Wallet.createRandom().connect(this.provider);
  private interval! : NodeJS.Timer;

  async deployChallenge(): Promise<void> {

    // Need to wait for mine because proxy requires 
    // bytecode to be available and so it will fail eth_estimateGas
    const deployedLogicContract = await this.deployContract(
      this.challengeContractName,
      [],
      {waitForMine: true}
    );
    
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(this.currentSecret));

    const abi = ["function init(bytes32 secretHash)"];
    const iface = new ethers.utils.Interface(abi);
    const data = iface.encodeFunctionData("init", [hash]);

    const deployedProxyContract = await this.deployContract(
        `TransparentUgradeableProxy`,
        [deployedLogicContract.contract.address, this.deployerWallet.address, data, {
          value: this.initialContractBalance
        }],
        {
            customPath: 'dependencies/OpenZeppelin/openzeppelin-contracts@4.3.2/TransparentUpgradeableProxy.json',
            // waitForMine: true
        }
    )

    // Fund dummy account that will perform the createlog tx's
    await this.fundAddressEth(this.runner.address, "100");
    
    // Set interval function to create log entry recurring
    this.interval = setInterval(() => {
      return this.runCreateLog(deployedLogicContract.contract, deployedProxyContract.contract.address);
    }, this.updateLogInterval,)

  }

  private async runCreateLog(logicContract: ethers.Contract, proxyContractAddress: string) {
    console.log("Attempting to create new log entry.");
    const proxyAttached = logicContract.attach(proxyContractAddress);
    const proxyConnected = proxyAttached.connect(this.runner);
    const newSecret = generateRandomString(30);
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(newSecret));
    try {
      await (await proxyConnected.createLogEntry("Yep pretty good day today", this.currentSecret, hash)).wait();
      this.currentSecret = newSecret;
      console.log("New password is", this.currentSecret);
    } catch (e) {
      console.log("transaction failed");
    }
  }

  resetChallenge() {
      super.resetChallenge();
      clearInterval(this.interval);
  }

  async getSolvedStatus(): Promise<SolveStatus> {
    const challengeContract = this.getDeployedContractByContractName(
        'TransparentUgradeableProxy'
      );
  
      const contractBalance: BigNumber =
        await this.provider.getBalance(
          challengeContract.address
        );
  
      const playerBalance: BigNumber =
        await this.provider.getBalance(
          this._playerWallet.address
        );
  
      console.log(
        "Current contract balance:",
        ethers.utils.formatEther(contractBalance)
      );
      console.log(
        "Current player balance:",
        ethers.utils.formatEther(playerBalance)
      );
  
      const solved = contractBalance.eq(0) && playerBalance.gt(this.initialContractBalance);
     
    const solveStatus: SolveStatus =  {
      solved,
      reason: "",
    }

    if (!solved) {
      solveStatus.reason = `Expected: Contract Balance: 0.0 ETH and Player Balance: > ${ethers.utils.formatEther(this.initialContractBalance)} ETH --- Actual: Contract Balance: ${ethers.utils.formatEther(contractBalance)} ETH and Player Balance: ${ethers.utils.formatEther(playerBalance)} ETH`
    }
    return solveStatus;

  }
}
