// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title Private Log
 * @author Blue Alder (https://duc.tf)
 **/

//  This contract only exists so that the Proxy contract is pulled into the dependecies folder for a direct deployment
//  Nothing to do with the challenge :)

import "OpenZeppelin/openzeppelin-contracts@4.3.2/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

abstract contract PrivateLogProxy is TransparentUpgradeableProxy {

    function nothing() private {
        revert();
    }

}