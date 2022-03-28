// SPDX-License-Identifier: MIT

// copy-pasted together by @Kibou_web3
// - Based on a super ultra mega optimized ERC721B by beskay
// - Supports OpenSea gas-free listing

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@beskay/erc721b/contracts/ERC721B.sol';
import './IProxyRegistry.sol';

contract Blob is ERC721B, Ownable {
    using Strings for uint256;

    // OpenSea"s Proxy Registry
    IProxyRegistry public immutable proxyRegistry;

    // The argument is the address of OpenSea's ProxyRegistry (complies with IProxyRegistry)
    constructor(IProxyRegistry _proxyRegistry) ERC721B("Blob", "BLB") {
        proxyRegistry = _proxyRegistry;
    }

    /**
     * @notice Override isApprovedForAll to whitelist user"s OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator) public view override(ERC721B) returns (bool) {
        // Whitelist OpenSea proxy contract for easy trading.
        if (proxyRegistry.proxies(owner) == operator) {
            return true;
        }
        return super.isApprovedForAll(owner, operator);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        if (!_exists(_tokenId)) revert OwnerQueryForNonexistentToken();
        return string(abi.encodePacked("https://blob-war.herokuapp.com/api/token/", Strings.toString(_tokenId)));
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function safeMint(
        address to,
        uint256 quantity,
        bytes memory _data
    ) public {
        _safeMint(to, quantity, _data);
    }

    function mint(address to, uint256 quantity) public {
        _mint(to, quantity);
    }
}