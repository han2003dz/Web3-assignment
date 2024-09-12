// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyTokenERC721 is ERC721 {

  uint256 public _tokenIds;

  mapping(address => uint256[]) private _ownedTokens;

  constructor() ERC721("MyTokenERC721", "MTE721") {}

  function mint(address to) public returns(uint256) {
    _tokenIds++;
    _safeMint(to, _tokenIds);
    _ownedTokens[to].push(_tokenIds);
    return _tokenIds;
  }
  
  function getOwnedTokenIds(address owner) public view returns(uint256[] memory) {
    return _ownedTokens[owner];
  }
}