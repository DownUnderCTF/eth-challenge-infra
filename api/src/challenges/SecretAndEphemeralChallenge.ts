import { BigNumber, ethers } from "ethers";
import { Challenge, SolveStatus } from "./Challenge";

/**
 * Challenge Name: Not Yours Challenge
 * Difficulty: Medium
 * Author: @BlueAlder
 */
export class SecretAndEphemeralChallenge extends Challenge {
  challengeContractName = "SecretAndEphemeral";
  readonly challengeName = "Secret and Ephemeral"
  private contractStringSecret = "so anyways i just started blasting";
  private contractNumberSecret = Number("0xdec0ded");
  private initialContractBalance = ethers.utils.parseEther("10"); //ether

  async deployChallenge(): Promise<void> {
    const deployedNotYoursContract = await this.deployContract(
      this.challengeContractName,
      [this.contractStringSecret, this.contractNumberSecret]
    );

    // Deposit 10 ETH into contract

    await deployedNotYoursContract.contract.giveTheFunds({
      value: this.initialContractBalance,
    });
  }

  async getSolvedStatus(): Promise<SolveStatus> {
    const challengeContract = this.getDeployedContractByContractName(
      this.challengeContractName
    );

    const contractBalance: BigNumber = await this.provider.getBalance(
      challengeContract.address
    );

    const playerBalance: BigNumber = await this.provider.getBalance(
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

    const solved =
      contractBalance.eq(0) && playerBalance.gt(this.initialContractBalance);

    const solveStatus: SolveStatus = {
      solved: solved,
      reason: "",
    };

    if (!solved) {
      solveStatus.reason = `Expected: Contract Balance: 0.0 ETH and Player Balance: > ${ethers.utils.formatEther(this.initialContractBalance)} ETH --- Actual: Contract Balance: ${ethers.utils.formatEther(
        contractBalance
      )} ETH and Player Balance: ${ethers.utils.formatEther(
        playerBalance
      )} ETH`;
    }

    return solveStatus;
  }
}
