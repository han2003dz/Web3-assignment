// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MyERC721.sol";
import "./MyERC20.sol";

contract Logic {
    // IERC20 public tokenERC20;
    MyTokenERC20 public tokenERC20;
    MyTokenERC721 public nft;
    address public owner;

    uint256 public constant INTEREST_RATE = 8; // 8% per year
    uint256 public constant INTEREST_RATE_INCREMENT = 2; // 2% increment per NFT
    uint256 public constant LOCK_TIME = 5 minutes;
    uint256 public constant NFT_THRESHOLD = 1_000_000 ether;

    struct UserInfo {
        uint256 depositAmount;
        uint256 depositTime;
        uint256 interestRate;
        uint256 nftCount;
    }

    mapping(address => UserInfo) public users;

    event Deposit(address indexed user, uint256 amount, uint256 depositTime);
    event Withdraw(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);
    event MintNFT(address indexed user, uint256 tokenId);

    constructor(address _tokenERC20, address _nft) {
        // tokenERC20 = IERC20(_tokenERC20);
        tokenERC20 = MyTokenERC20(_tokenERC20);
        nft = MyTokenERC721(_nft);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Deposit function
    function deposit(uint256 amount) external {
        require(amount > 0, "Deposit amount should be greater than 0");
        
        UserInfo storage user = users[msg.sender];
        uint256 currentInterestRate = INTEREST_RATE + (INTEREST_RATE_INCREMENT * user.nftCount);

        tokenERC20.transferFrom(msg.sender, address(this), amount);
        
        user.depositAmount += amount;
        user.depositTime = block.timestamp;
        user.interestRate = currentInterestRate;

        emit Deposit(msg.sender, amount, block.timestamp);

        // Check for NFT minting
        if (user.depositAmount >= NFT_THRESHOLD) {
            uint256 tokenId = mintNFT();
            emit MintNFT(msg.sender, tokenId);
        }
    }

    // Withdraw function
    function withdraw() external {
        UserInfo storage user = users[msg.sender];
        require(user.depositAmount > 0, "No deposit to withdraw");
        require(block.timestamp >= user.depositTime + LOCK_TIME, "Lock time not passed");

        uint256 interest = calculateInterest(msg.sender);
        tokenERC20.mintInterest(interest, msg.sender);
        // uint256 totalAmount = user.depositAmount + interest;

        // require(tokenERC20.balanceOf(address(this)) >= totalAmount, "Contract does not have enough balance");
        tokenERC20.transfer(msg.sender, user.depositAmount);

        emit Withdraw(msg.sender, user.depositAmount, interest, block.timestamp);

        user.depositAmount = 0; // Reset user's deposit amount
        user.depositTime = 0; // Reset deposit time
        user.interestRate = 0; // Reset interest rate
    }

    // Mint NFT function
    function mintNFT() internal returns (uint256) {
        return nft.mint(msg.sender);
    }

    // Calculate interest function
    function calculateInterest(address spender) public view returns (uint256) {
        UserInfo memory user = users[spender];
        uint256 timeElapsed = block.timestamp - user.depositTime;
        uint256 interest = (user.depositAmount * user.interestRate * timeElapsed) / (365 * 24 * 60 * 60 * 100);
        return interest;
    }

    // Deposit NFT function to increase interest rate
    function depositNFT(uint256 tokenId) external {
        UserInfo storage user = users[msg.sender];
        nft.transferFrom(msg.sender, address(this), tokenId);
        user.nftCount += 1;
        user.interestRate = INTEREST_RATE + (INTEREST_RATE_INCREMENT * user.nftCount);
    }

    // Withdraw NFT function
    function withdrawNFT(uint256 tokenId) external {
        UserInfo storage user = users[msg.sender];
        require(user.nftCount > 0, "No NFTs to withdraw");

        nft.transferFrom(address(this), msg.sender, tokenId);
        user.nftCount -= 1;
        user.interestRate = INTEREST_RATE + (INTEREST_RATE_INCREMENT * user.nftCount);
    }

    function claimReward() external {
        UserInfo storage user = users[msg.sender];
        require(user.depositAmount > 0, "amount must be greater than zero");
        require(block.timestamp >= user.depositTime + LOCK_TIME, "Tokens are locked");
        uint256 interest = calculateInterest(msg.sender);
        require(interest > 0, "No interest accrued");
        tokenERC20.transfer(msg.sender, interest);

        user.depositTime = block.timestamp;
    }

    function getDepositAmount(address user) external view returns (uint256) {
        return users[user].depositAmount;
    }

    function getInterestRate(address user) external view returns (uint256) {
        return users[user].interestRate;
    }

    function getDepositedNFTCount(address user) external view returns (uint256) {
        return users[user].nftCount;
    } 
}
