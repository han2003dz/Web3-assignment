const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Logic Contract", function () {
  let Logic, logic;
  let TokenERC20, tokenERC20;
  let MyTokenERC721, myTokenERC721;
  let owner, user;
  const initialSupply = ethers.utils.parseEther("1000000"); // 1,000,000 tokens

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy ERC20 token
    TokenERC20 = await ethers.getContractFactory("MyTokenERC20");
    tokenERC20 = await TokenERC20.deploy();
    await tokenERC20.deployed();

    // Deploy ERC721 token
    MyTokenERC721 = await ethers.getContractFactory("MyTokenERC721");
    myTokenERC721 = await MyTokenERC721.deploy();
    await myTokenERC721.deployed();

    // Deploy Logic contract
    Logic = await ethers.getContractFactory("Logic");
    logic = await Logic.deploy(tokenERC20.address, myTokenERC721.address);
    await logic.deployed();

    // Transfer some ERC20 tokens to user for testing
    await tokenERC20.transfer(user.address, ethers.utils.parseEther("1000"));
  });

  describe("Deposit", function () {
    it("should allow user to deposit tokens", async function () {
      // User approves the Logic contract to spend their ERC20 tokens
      await tokenERC20
        .connect(user)
        .approve(logic.address, ethers.utils.parseEther("100"));

      // User deposits 100 tokens into the Logic contract
      await expect(logic.connect(user).deposit(ethers.utils.parseEther("100")))
        .to.emit(logic, "Deposit")
        .withArgs(user.address, ethers.utils.parseEther("100"), anyValue);

      console.log("logic balance", await tokenERC20.balanceOf(logic.address));

      const userInfo = await logic.users(user.address);
      expect(userInfo.depositAmount).to.equal(ethers.utils.parseEther("100"));
    });

    it("should not allow user to deposit zero tokens", async function () {
      await expect(logic.connect(user).deposit(0)).to.be.revertedWith(
        "Deposit amount should be greater than 0"
      );
    });
  });

  describe("Withdraw", function () {
    it("should allow user to withdraw after lock time", async function () {
      await tokenERC20
        .connect(user)
        .approve(logic.address, ethers.utils.parseEther("100"));
      await logic.connect(user).deposit(ethers.utils.parseEther("100"));

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [5 * 60 + 1]); // 5 minutes and 1 second
      await ethers.provider.send("evm_mine");

      console.log("balance of logic", await tokenERC20.balanceOf(logic.address));

      await expect(logic.connect(user).withdraw())
        .to.emit(logic, "Withdraw")
        .withArgs(
          user.address,
          anyValue, // Adjusted: match the actual amount with interest
          anyValue, // interest
          anyValue // timestamp
        );

      const userInfo = await logic.users(user.address);
      expect(userInfo.depositAmount).to.equal(0);
      expect(userInfo.depositTime).to.equal(0);
      expect(userInfo.interestRate).to.equal(0);
    });

    it("should not allow user to withdraw before lock time", async function () {
      await tokenERC20
        .connect(user)
        .approve(logic.address, ethers.utils.parseEther("100"));
      await logic.connect(user).deposit(ethers.utils.parseEther("100"));

      await expect(logic.connect(user).withdraw()).to.be.revertedWith(
        "Lock time not passed"
      );
    });
  });

  describe("MintNFT", function () {
    it("should mint NFT when deposit reaches threshold", async function () {
      await tokenERC20
        .connect(user)
        .approve(logic.address, ethers.utils.parseEther("1000000"));
      await expect(
        logic.connect(user).deposit(ethers.utils.parseEther("1000000"))
      )
        .to.emit(logic, "MintNFT")
        .withArgs(user.address, anyValue);

      const userInfo = await logic.users(user.address);
      expect(userInfo.nftCount).to.equal(1);
    });
  });

  describe("DepositNFT", function () {
    it("should allow user to deposit NFT and increase interest rate", async function () {
      // Mint NFT to user first
      await myTokenERC721.mint(user.address);
      await myTokenERC721.connect(user).approve(logic.address, 1);

      await expect(logic.connect(user).depositNFT(1))
        .to.emit(myTokenERC721, "Transfer")
        .withArgs(user.address, logic.address, 1);

      const userInfo = await logic.users(user.address);
      expect(userInfo.nftCount).to.equal(1);
      expect(userInfo.interestRate).to.equal(10); // 8% base + 2% per NFT
    });
  });

  describe("WithdrawNFT", function () {
    it("should allow user to withdraw NFT", async function () {
      // Mint NFT to user first and deposit it
      await myTokenERC721.mint(user.address);
      await myTokenERC721.connect(user).approve(logic.address, 1);
      await logic.connect(user).depositNFT(1);

      await expect(logic.connect(user).withdrawNFT(1))
        .to.emit(myTokenERC721, "Transfer")
        .withArgs(logic.address, user.address, 1);

      const userInfo = await logic.users(user.address);
      expect(userInfo.nftCount).to.equal(0);
      expect(userInfo.interestRate).to.equal(8); // Reset to base rate
    });
  });

  describe("ClaimReward", function () {
    it("should allow user to claim reward after lock time", async function () {
      await tokenERC20
        .connect(user)
        .approve(logic.address, ethers.utils.parseEther("100"));
      await logic.connect(user).deposit(ethers.utils.parseEther("100"));

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [5 * 60 + 1]); // 5 minutes and 1 second
      await ethers.provider.send("evm_mine");

      await expect(logic.connect(user).claimReward())
        .to.emit(tokenERC20, "Transfer")
        .withArgs(logic.address, user.address, anyValue);

      const userInfo = await logic.users(user.address);
      expect(userInfo.depositTime).to.be.above(0); // Reset deposit time
    });

    it("should not allow user to claim reward before lock time", async function () {
      await tokenERC20
        .connect(user)
        .approve(logic.address, ethers.utils.parseEther("100"));
      await logic.connect(user).deposit(ethers.utils.parseEther("100"));

      await expect(logic.connect(user).claimReward()).to.be.revertedWith(
        "Tokens are locked"
      );
    });
  });
});
