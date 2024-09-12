// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// // import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// import "./MyERC721.sol";
// contract Logic {
//     MyTokenERC721 public tokenERC721;

//     IERC20 public erc20Contract;
//     IERC721 public nft721;
//     address public owner;

//     uint256 public constant LOCK_TIME = 5 minutes;
//     uint256 public constant BASE_INTEREST_RATE = 8;
//     uint256 public constant INTEREST_RATE_INCREMENT = 2;
//     uint256 public constant TARGET_AMOUNT = 1_000_000 * 10 ** 18;

//     struct Deposit {
//         address sender;
//         uint8 nftCount;
//         uint256 amount;
//         uint256 startTime;
//         uint256 interestRate;
//         uint256[] depositedNFTs;
//     }

//     struct UserInfo {
//         uint256 depositAmount;
//         uint256 depositTime;
//         uint256 interestRate;
//         uint256 nftCount;
//     }
//     mapping (address => Deposit) deposits;
//     mapping (address => UserInfo) public users;

//     event Deposit(address indexed user, uint256 amount, uint256 depositTime);
//     event Withdraw(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);
//     event MintNFT(address indexed user, uint256 tokenId);
    

//     event DepositMade(address indexed spender, uint256 amount, uint256 newTotal, uint256 timestamp);
//     event RewardClaimed(address indexed spender, uint256 reward, uint256 date);
//     event WithdrawalMade(address indexed spender, uint256 amount, uint256 interest, uint256 date);
//     event NFTMinted(address indexed recipient, uint256 tokenId);
//     event NFTDeposited(address indexed spender, uint256 tokenId, uint256 timestamp);
//     event NFTClaimed(address indexed spender, uint256 tokenId, uint256 timestamp);

//     constructor(address _erc20Contract, address _erc721Contract) {
//         erc20Contract = IERC20(_erc20Contract);
//         tokenERC721 = MyTokenERC721(_erc721Contract);
//     }

//     function deposit(uint256 _amount) external {
//         require(_amount > 0, "Amount must be greater than 0");
//         require(erc20Contract.balanceOf(msg.sender) >= _amount, "Insufficient balance");

//         Deposit storage userDeposit = deposits[msg.sender];
//         userDeposit.amount += _amount;
//         userDeposit.startTime = block.timestamp;
//         userDeposit.interestRate = BASE_INTEREST_RATE + userDeposit.nftCount * 2;

//         erc20Contract.transferFrom((msg.sender), address(this), _amount);

//         emit DepositMade(msg.sender, _amount, userDeposit.amount, block.timestamp);

//         if (userDeposit.amount >= 1_000_000 * 10 ** 18 && userDeposit.nftCount == 0) {
//             uint256 tokenId = tokenERC721.mint(msg.sender);
//             // userDeposit.nftCount++;
//             // userDeposit.depositedNFTs.push(tokenId);
//             emit NFTClaimed(msg.sender, tokenId, block.timestamp);
//         }
//     }

//     function depositNFT(uint256 tokenId) external {
//         tokenERC721.transferFrom(msg.sender, address(this), tokenId);

//         Deposit storage userDeposit = deposits[msg.sender];
//         userDeposit.nftCount++;
//         userDeposit.interestRate = BASE_INTEREST_RATE + (userDeposit.nftCount * 2);
//         userDeposit.depositedNFTs.push(tokenId);
//         userDeposit.startTime = block.timestamp;
    
//         emit NFTDeposited(msg.sender, tokenId, block.timestamp);
//     }

//     function calculateInterestRate(address spender) public view returns (uint256) {
//         Deposit memory userDeposit = deposits[spender];
//         uint256 timeElapsed = block.timestamp - userDeposit.startTime;
//         uint256 interest = (userDeposit.amount * userDeposit.interestRate * timeElapsed) / (365 days * 100);
//         return interest;
//     }

//     function getDepositAmount(address spender) external view returns (uint256) {
//         return deposits[spender].amount;
//     }

//     function getInterestRate(address spender) external view returns (uint256) {
//         Deposit memory userDeposit = deposits[spender];
//         return userDeposit.interestRate;
//     }

//     function getDepositedNFTCount(address spender) external view returns (uint8) {
//         return deposits[spender].nftCount;
//     }

//     function withdraw() external {
//         Deposit storage userDeposit = deposits[msg.sender];
//         require(block.timestamp >= userDeposit.startTime + LOCK_TIME, "Tokens are locked");

//         uint256 interest = calculateInterestRate(msg.sender);
//         uint256 totalAmount = userDeposit.amount + interest;

//         erc20Contract.transfer(msg.sender, totalAmount);

//         emit WithdrawalMade(msg.sender, userDeposit.amount, interest, block.timestamp);

//         userDeposit.amount = 0;
//         userDeposit.startTime = 0;
//         userDeposit.interestRate = BASE_INTEREST_RATE + (userDeposit.nftCount * 2);
//     }

//     function claimNFT(uint256 tokenId) external {
//         Deposit storage userDeposit = deposits[msg.sender];
//         require(userDeposit.nftCount > 0, "No NFTs to claim");

//         // Remove the NFT from the array
//         uint256 length = userDeposit.depositedNFTs.length;
//         for (uint256 i = 0; i < length; i++) {
//             if (userDeposit.depositedNFTs[i] == tokenId) {
//                 userDeposit.depositedNFTs[i] = userDeposit.depositedNFTs[length - 1];
//                 userDeposit.depositedNFTs.pop();
//                 break;
//             }
//         }

//         userDeposit.nftCount--;
//         userDeposit.interestRate = BASE_INTEREST_RATE + (userDeposit.nftCount * 2);

//         tokenERC721.transferFrom(address(this), msg.sender, tokenId);

//         emit NFTClaimed(msg.sender, tokenId, block.timestamp);
//     }

//     function claimReward() external {
//         Deposit storage userDeposit = deposits[msg.sender];
//         require(userDeposit.amount > 0, "No deposit found");
//         require(block.timestamp >= userDeposit.startTime + LOCK_TIME, "Tokens are locked");

//         // Calculate the full interest accrued
//         uint256 interest = calculateInterestRate(msg.sender);
//         require(interest > 0, "No interest accrued");

//         // Transfer the full interest to the user
//         erc20Contract.transfer(msg.sender, interest);

//         // Reset the start time to the current time
//         userDeposit.startTime = block.timestamp;

//         emit RewardClaimed(msg.sender, interest, block.timestamp);
//     }

// }