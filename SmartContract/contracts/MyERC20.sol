// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract MyTokenERC20 is ERC20, Ownable {
//   address public admin;
//   constructor() ERC20("MyTokenERC20", "MTERC20") Ownable(msg.sender){
//     _mint(owner(), 10_000_000 * 10 ** 18);
//     approve(address(this), 10_000_000 * 10 ** 18);
//   }

//   modifier onlyAdmin() {
//     require(owner() == msg.sender, "Only admin is allowed");
//     _;
//   }

//   function mint(address account, uint256 amount) external onlyAdmin {
//     _mint(account, amount);
//   }

//   function faucetERC20(address user) public {
//     uint256 faucetAmount = 1_000_000 * 10 ** 18;
//     require(balanceOf(address(this)) >= faucetAmount, "Contract does not have enough tokens for faucet");
//     _transfer(address(this), user, faucetAmount);
//   }
// }


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyTokenERC20 is ERC20, Ownable {
    constructor() ERC20("MyTokenERC20", "MTERC20") Ownable(msg.sender){
        _mint(address(this), 10_000_000 * 10 ** 18);
    }

    modifier onlyAdmin() {
        require(owner() == msg.sender, "Only admin is allowed");
        _;
    }

    function mint(address account, uint256 amount) external onlyAdmin {
        _mint(account, amount);
    }

    function faucetERC20(address user) public {
        uint256 faucetAmount = 1_000_000 * 10 ** 18;
        require(balanceOf(address(this)) >= faucetAmount, "Contract does not have enough tokens for faucet");
        _transfer(address(this), user, faucetAmount);
    }

    function mintInterest(uint256 interest, address user) public {
        _transfer(address(this), user, interest);
    }
}
