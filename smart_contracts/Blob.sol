// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IBlob.sol";

contract Blob is ERC721, ERC721Enumerable, Ownable, IBlob {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Blob", "BLB") {}

    uint256 blob_cost = 0.01 ether;

    function buyBlob() external payable override {
        // take ONLY blob_cost eth
        require(msg.value == blob_cost, "Invalid cost");

        // send funds to the deployer wallet automatically
        (bool sent, ) = this.owner().call{value: blob_cost}("");
        require(sent, "Failed to sent eth");

        // mint a blob
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);

        emit BlobBought(msg.sender, tokenId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://blobwars.cool/blob_data?id=";
    }

    // overrides needed by Solidity

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
