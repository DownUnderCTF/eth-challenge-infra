// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {Setup} from "./Setup.sol";
/**
 * @title SolveMe
 * @author BlueAlder duc.tf
 */

contract SolveMe {
    bool public isSolved = false;

    function solveChallenge() external {
        isSolved = true;
    }
}

/**
 * @dev This is the Setup Contract which checks if the challenge is solved or not
 * (not a part of the challenge)
 */
contract SetupSolveMe is Setup {
    constructor(address player_address) Setup(player_address) {}

    function deploy() public override returns (address) {
        SolveMe _instance = new SolveMe();
        return address(_instance);
    }

    function isSolved() external view override returns (bool) {
        return SolveMe(challenge).isSolved();
    }
}
