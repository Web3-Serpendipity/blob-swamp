// SPDX-License-Identifier: MIT
// https://etherscan.io/address/0x8d6238920d9a54bf048436d4119475a002d51fd6#code

pragma solidity ^0.8.9;

interface IProxyRegistry {
    function proxies(address) external view returns (address);
}