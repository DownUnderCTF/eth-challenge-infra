// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title SolveMe
 * @author BlueAlder duc.tf
 */

abstract contract Setup {
    // Maps the contract name to it's corresponding deployed address
    mapping(string => address) public challengeContractAddresses;

    function deploy() external virtual;

    function isSolved() external view virtual returns (bool);
}
