# DownUnder CTF Eth Challenge Infra

This infrastructure allows for deployment, checking solutions and resetting of blockchain challenges on a provided PoA geth blockchain.

This Repo currently is heavily coupled with the [DownUnderCTF](https://downunderctf.com) blockchain challenges, but can be extended.


## Usage

There are two parts to each blockchain challenge:

1. `geth/` GETH container which runs a single node that listens and mines a new block on each new transaction (by default)
2. `api/` The API that interacts with the Blockchain that deploys contracts and checks if the end state of the blockchain is correct. This also contains the contracts of the challenges that you want to deploy.

## Geth setup

### With default accounts

The default accounts that are in this repo are:

Sealer: `0xdd042353ae6f0d5a8c17b24a867466f96f39608a`
Deployer: `0xDC7F024F73bEdc6134263Beff4bEcDB46C2ea5c6`

To use these accounts you will need the private key for the deployer and the password for the sealer. Which are located in the .secret files in the respective directories.

You should be able to get going without any additional setup with `docker compose build && docker compose up`.

### With new accounts

This will set you up with a new sealer and deployer account which you will generate a new genesis block for the chain.

First you will need to set up the blockchain with the settings that you want. For a default setup, use the README.md file from chainflag [here](https://github.com/chainflag/eth-challenge-base/tree/main/geth#usage).

You will first need to create a `sealer` account which does the sealing.

You will also want to create a `deployer` account, which will be the wallet which deploys all the challenges. I reccomend pre-funding both.

```
$ go install github.com/ethereum/go-ethereum/cmd/puppeth@latest # or download Geth & Tools from https://geth.ethereum.org/downloads/
$ puppeth
Please specify a network name to administer (no spaces, hyphens or capital letters please)
> ductf
What would you like to do? (default = stats)
 1. Show network stats
 2. Configure new genesis
 3. Track new remote server
 4. Deploy network components
> 2
What would you like to do? (default = create)
 1. Create new genesis from scratch
 2. Import already existing genesis
> 1
Which consensus engine to use? (default = clique)
 1. Ethash - proof-of-work
 2. Clique - proof-of-authority
> 2
How many seconds should blocks take? (default = 15)
>
Which accounts are allowed to seal? (mandatory at least one)
> 0x # Enter the address of the sealer
Which accounts should be pre-funded? (advisable at least one)
> 0x # Enter the account address created in the previous step and deployer address
Should the precompile-addresses (0x1 .. 0xff) be pre-funded with 1 wei? (advisable yes)
> no
Specify your chain/network ID if you want an explicit one (default = random)
> 31337
What would you like to do? (default = stats)
 1. Show network stats
 2. Manage existing genesis
 3. Track new remote server
 4. Deploy network components
> 2
 1. Modify existing configurations
 2. Export genesis configurations
 3. Remove genesis configuration
> 2
Which folder to save the genesis specs into? (default = current)
  Will create genesis.json, genesis-aleth.json, genesis-harmony.json, genesis-parity.json
> config
```


Essentially you need:
- A sealer account which will be used to mine the transactions and hold all the ETH
- A deployer account which will be used to deploy all the chals.
- A genisis config called `ductf.json` which specifies how the chain will run

NOTE: In the genesis config you will need to prefund the 'deployer' account which is used to deploy the challenges. The private key for this account will need to be provided in the API.

Once this is up and running with 

```
docker compose up -d
```

## API/Challenge Setup

Within the `api/` folder lives the API that will manage the deployment of the challenge and will determine whether the challenge is solved or not.

To create a challenge you will need to do 2 things.

### Create a Challenge Contract
To create a challenge contract using solidity head over to `api/contracts/contracts/` (brownie makes me force this structure). Create your new .sol file in a challenge dir there and then once you're done with it you will need to compile it so it builds the JSON abi (which is located in the build/ dir).

Install brownie and run `brownie compile` and hopefully you're all good. Then move onto implementing the code.

### Implement Code

1. Create a new Challenge class in `api/src/challenges/` which extends the `BaseChallenge` class. Implement the required functions and fields and implement the logic for the deploy and isSolved function.

2. In `api/src/challenge-manager/index.ts` update the constructor such that the `_challenge` field creates a new instance of your Challenge class.


### Update Env Variables

You will need to update the `.env` files in the API (or in the docker compose file) with three env variables.

- BLOCKCHAIN_URL: The url of the endpoint for which the api should connect to, usually http://localhost:8545
- DEPLOYER_PRIV_KEY: The private key of the deployer account that you created when setting up geth
- CHALLENGE: The name of the challenge that you wish to be deployed when the API starts up.