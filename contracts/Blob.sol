// SPDX-License-Identifier: MIT

// copy-pasted together by @Kibou_web3
// - Based on a super ultra mega optimized ERC721B by beskay
// - Supports OpenSea gas-free listing

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import './ERC721B.sol';
import './ERC721MetaTransactionMaticSample.sol';

/*
contract Blob is ERC721B, Ownable, ContextMixin {
}*/

contract Blob is ERC721B, Ownable, ContextMixin, NativeMetaTransaction {
    using Strings for uint256;

    error NotEnoughEther();
    error SupplyExceeded();
    error WithdrawFailed();

    //
    // Constants
    //

    uint256 private constant MAX_SUPPLY = 100;
    uint256 private constant PRICE = 0.01 ether;
    address private immutable proxyRegistry;

    string public baseUri = "https://blob-war.herokuapp.com/api/token/";

    // Polygon 0x58807baD0B376efc12F5AD86aAc70E78ed67deaE
    // Mumbai 0xff7Ca10aF37178BdD056628eF42fD7F799fAc77c

    // The argument is the address of OpenSea's ProxyRegistry (complies with IProxyRegistry)
    constructor(address _proxyRegistry) ERC721B("Blob", "BLB") Ownable() {
        proxyRegistry = _proxyRegistry;
    }

    // @notice Override isApprovedForAll to whitelist user"s OpenSea proxy accounts to enable gas-less listings.
    function isApprovedForAll(address owner, address operator) public view override(ERC721B) returns (bool) {
        // Whitelist OpenSea proxy contract for easy trading.
        if (operator == proxyRegistry) {
            return true;
        }
        return super.isApprovedForAll(owner, operator);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(address to, uint256 quantity) external payable {
        if (totalSupply() + quantity > MAX_SUPPLY) revert SupplyExceeded();
        if (msg.value < PRICE * quantity) revert NotEnoughEther();

        // checks that the recipient is a valid ERC721 reciever - better safe than sorry
        _safeMint(to, quantity);
    }

    function setBaseUri(string calldata _baseUri) public onlyOwner {
        baseUri = _baseUri;
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        if (!_exists(_tokenId)) revert OwnerQueryForNonexistentToken();
        return string(abi.encodePacked(baseUri, Strings.toString(_tokenId)));
    }

    // TODO: splitting profits
    function withdraw() public onlyOwner {
        (bool succ, ) = _msgSender().call{value: address(this).balance}("");
        if (!succ)
            revert WithdrawFailed();
    }

    // This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
    function _msgSender()
        internal
        override
        view
        returns (address sender)
    {
        return ContextMixin.msgSender();
    }
}