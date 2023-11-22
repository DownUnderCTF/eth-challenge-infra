import { z } from "zod";

// Defines the config file object
export const challengeConfigSchema = z.object({
  challenge_name: z.string(),
  challenge_description: z.string(),
  setup_contract_name: z.string(),
  flag: z.string(),
  block_time: z.number(),

  // optional flags
  challenge_source_files: z.optional(z.array(z.string())),
  player_initial_balance: z.optional(z.number().positive()),
  contract_initial_balance: z.optional(z.number().positive()),
  enable_faucet: z.optional(z.boolean()),
  challenge_solve_type: z.optional(z.enum(["function", "event"])),
});

export type ChallengeConfigSchema = z.infer<typeof challengeConfigSchema>;

export class ChallengeConfig {
  readonly challengeName: string;
  readonly challengeDescription: string;
  readonly challengeSourceFiles: string[];
  readonly setupContractName: string;
  readonly flag: string;
  readonly playerInitialBalance: string;
  readonly contractInitialBalance: string;
  readonly faucetEnabled: boolean;
  readonly challengeSolveType: string;
  readonly blockTime: number;

  constructor(unparsedConfig: unknown) {
    const config = challengeConfigSchema.parse(unparsedConfig);
    this.challengeName = config.challenge_name;
    this.challengeDescription = config.challenge_description;
    this.setupContractName = config.setup_contract_name;
    this.flag = config.flag;
    this.blockTime = config.block_time;

    // options with defaults
    this.challengeSourceFiles = config.challenge_source_files || [];
    this.playerInitialBalance =
      config.player_initial_balance?.toString() || "1";
    this.contractInitialBalance =
      config.contract_initial_balance?.toString() || "0";
    this.faucetEnabled = config.enable_faucet || false;
    this.challengeSolveType = config.challenge_solve_type || "function";
  }
}
