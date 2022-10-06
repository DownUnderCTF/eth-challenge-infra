import path from "path";
import fs from "fs";
import { Contract } from "ethers";


/**
 * Class to load default solidity data for a contracts abi for deployment.
 */
export class ContractABI {
    solidityData: string;

    constructor(_pathToContract: string) {
        const pathToContract = path.resolve(_pathToContract);
        this.solidityData = fs.readFileSync(pathToContract).toString();
    }
}

/**
 * Simple SuperClass of Contract to give it a name
 * Probs could do something with prototype but cbf.
 */
export type DeployedContract  = {
    name: string;
    contract: Contract
}