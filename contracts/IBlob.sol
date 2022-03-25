// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IBlob is IERC721 {
	/// Emitted when a new blob is minted by a player.
	event BlobBought(address player, uint256 tokenId);

	/// IERC721: @dev This emits when ownership of any NFT changes by any mechanism.
	//event Transfer(address from, address to, uint256 tokenId); // ERC721

	/// mints a blob for the person calling it and emits BlobBought
	function buyBlob() external payable;

	/// IERC721: @notice Transfers the ownership of an NFT from one address to another address
    //function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;
}