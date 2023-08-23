# Eth CTF Challenge V2
This is the infrastructure that can runs an individual ETH CTF challenge
for an individual player. Manages challenge lifecycle, player account creation, flag
management and the blockchain itself. Web UI to interact with the challenge.

Heavily inspired by https://github.com/chainflag/solidctf. The backend API is
written in Typescript and supports 1 Chain, 1 Challenge,  and 1 Team, at a time.

Contains a containerized blockchain node which can be used to deploy contracts onto however it is not required and you can point the deployment to any ethereum RPC endpoint

Built for [DownUnderCTF](https://downunderctf.com).

## Usage

### Example Challenge

To get up and running with straight away with the example challenge connecting
to a local geth blockchain: 

```bash
docker compose up
```

Access the API at `http://localhost:3000` and the chain RPC url at
`http://localhost:8545`.

### I just want to run a challenge

The easiest way to get up and running with your own challenge is to use the published docker image `downunderctf/eth-base` and copy your contract files and compiled ABI as well as your `challenge.yaml` as shown in the example folder. Then ensure that your environment variables are set correctly

The environemnt variables that are configurable for the API are:

|Variable|Description|DEFAULT|
|---|---|---|
| **BLOCKCHAIN_RPC_URL** | The JSON RPC endponit to connect to | http://localhost:8545|
| **DEPLOYER_PRIVATE_KEY** | The private key for the deployer address that you want to use | 35d7e3183bbe3e89907724a7c50a1e3f7207af30d169812534558f3591e27b30|
| **CONFIG_FILE_NAME** | The filename of the challenge configuration | challenge.yaml|

The `challenge.yaml` file is where the configuration of your challenge will live

```yaml
challenge_name: "Solve Me" 
challenge_description: "you gonna be solving this challenge alright"
setup_contract_name: "SetupSolveMe" # This is the name of the contract that should deploy your challenge and check if it is complete. It should inherit the Setup.sol contract
flag: "DUCTF{MA_NAME_JEFF_grace_epic}"

# Optional flags
player_initial_balance: 2 # in ether
# enable_faucet: false
challenge_source_files: # Source files to provide to the player
  - "SolveMe.sol"
```

## Dev

There are 3 distinct components to this repository

1. `src/` contains the backend API code which handles interations with the blockchain and managing the challenge state.
2. `ui/` contains the react frontend code which players interact with for challenge administration.
3. `geth/` is the containerized ethereum node which allows configuration of the blockchain itself. 


### Geth Setup

```bash
cd geth/
docker compose up 
```

The environment variables that are configurable are:

|Variable|Description|DEFAULT|
|---|---|---|
| **BLOCK_TIME** | How often a block is mined in seconds (use 0 for on demand mining) | 1|
| **DEPLOYER_PRIVATE_KEY** | The private key for the deployer address that you want to use | 35d7e3183bbe3e89907724a7c50a1e3f7207af30d169812534558f3591e27b30|
| **CHAIN_ID** | The chain's id| 31337|