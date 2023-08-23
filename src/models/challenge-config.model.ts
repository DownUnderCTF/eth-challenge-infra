export type ChallengeConfig = {
  challengeName: string; // Name of the CTF Challenge
  setupContractName: string; // Name of the contract to setup the challenge
  flag: string; // Flag for the challenge
  playerInitialBalance: string; // Initial balance in ETH of the player
  enableFaucet: boolean; // Whether faucet is enabled or not
  challengeContractNames: string[]; // Names of the contracts that will be deployed by the setup contract to be exposed to the player
  challengeSolveType: "function" | "event"; // Whether the challenge will be deemed solved by a `isSolved()` function or an emitted event (events not supported ATM).
  challengeDescription: string; // Description of the challenge to show up on the UI
  blockTime: number; // The time between blocks (this does not actually change anything on the API only what the API replies with)
};
