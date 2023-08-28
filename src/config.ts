import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT) || 3000;
export const HOST =
  process.env.HOST ||
  (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

export const BLOCKCHAIN_RPC_URL =
  process.env.BLOCKCHAIN_RPC_URL || "http://localhost:8545";

export const EXTERNAL_RPC_URL =
  process.env.EXTERNAL_RPC_URL || BLOCKCHAIN_RPC_URL;

export const CONFIG_FILE_NAME =
  process.env.CONFIG_FILE_NAME || "challenge.yaml";

if (!process.env.DEPLOYER_PRIVATE_KEY) {
  console.warn(
    "Unable to read DEPLOYER_PRIVATE_KEY from environment variables. Using the default private key for this repository. It is STRONGLY reccomended that you use a newly generated private key."
  );
}

export const DEPLOYER_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY ||
  "35d7e3183bbe3e89907724a7c50a1e3f7207af30d169812534558f3591e27b30";

export const ROOT_DIR =
  process.env.NODE_ENV === "production"
    ? process.cwd()
    : path.resolve(process.cwd(), "example");

export const CONTRACT_ABI_DIR =
  process.env.CONTRACT_ABI_DIR || path.resolve(ROOT_DIR, "build/contracts");

export const CONTRACT_DIR =
  process.env.CONRTACT_DIR || path.resolve(ROOT_DIR, "contracts");
