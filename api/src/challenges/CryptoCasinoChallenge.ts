import { Challenge, SolveStatus } from "./Challenge";

/**
 * Challenge Name: Crypto Casino
 * Difficulty: Easy
 * Author: @joseph
 */
export class CryptoCasinoChallenge extends Challenge {
  challengeContractName = "CryptoCasino";
  readonly challengeName = "Crypto Casino"

  async deployChallenge(): Promise<void> {
    const deployedDUCoinContract = await this.deployContract("DUCoin");

    const deployedCasinoContract = await this.deployContract(
      "Casino",
      [deployedDUCoinContract.contract.address]
    );

    await deployedDUCoinContract.contract.freeMoney(deployedCasinoContract.contract.address);

  }

  async getSolvedStatus(): Promise<SolveStatus> {
    const tokenContract = this.getDeployedContractByContractName("DUCoin")

    const playerBalance = await tokenContract.balanceOf(
      this._playerWallet.address
    )

    const solved = playerBalance.gt(1336)

    const solveStatus: SolveStatus = {
      solved: solved,
      reason: "",
    }

    if(!solved) {
      solveStatus.reason = `Expected: Player DUCoin balance >= 1337 DUC --- Actual: Player DUCoin Balance: ${playerBalance} DUC`
    }

    return solveStatus
  }
}
