import { Challenge, SolveStatus } from "./Challenge";

/**
 * Example Challenge one which corresponds to
 * contracts/SolveMe/SolveMe.sol
 */
export class SolveMeChallenge extends Challenge {
  challengeContractName = "SolveMe";
  readonly challengeName = "Solve Me";

  amountToFundPlayerWallet = "2";
  

  async deployChallenge(): Promise<void> {
    await this.deployContract(
      this.challengeContractName
    );

  }

  async getSolvedStatus(): Promise<SolveStatus> {
    const solved =  await this.getDeployedContractByContractName(
      this.challengeContractName
    ).isSolved();

    return {
      solved,
      reason: "The challenge isn't solved ;)"
    }
  }
}
