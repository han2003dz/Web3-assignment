const { Web3 } = require("web3");
const providerURL = process.env.NETWORK_RPC;
const web3 = new Web3(providerURL);
const { transactionService } = require("../services");

const handleLogicEvents = async (event, blockTimeStamp, synchronize) => {
  const { event: eventName, returnValues } = event;
  console.log(
    "Processing event:",
    eventName,
    "with return values:",
    returnValues
  );

  try {
    switch (eventName) {
      case "Deposit":
        await handleDepositEvent(
          event,
          returnValues,
          blockTimeStamp,
          synchronize
        );
        break;
      case "Withdraw":
        await handleWithdrawEvent(
          event,
          returnValues,
          blockTimeStamp,
          synchronize
        );
        break;
      case "MintNFT":
        await handleMintNFTEvent(
          event,
          returnValues,
          blockTimeStamp,
          synchronize
        );
        break;
      default:
        console.warn(`Unhandled event: ${eventName}`);
        break;
    }
  } catch (error) {
    console.error(`Error processing event ${eventName}:`, error);
  }
};

const handleDepositEvent = async (
  event,
  returnValues,
  blockTimeStamp,
  synchronize
) => {
  const { user, amount, depositTime } = returnValues;
  const date = new Date(Number(depositTime) * 1000);

  const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
  const gasUsed = receipt.gasUsed;
  console.log("gasUsed", gasUsed);

  const tx = await web3.eth.getTransaction(event.transactionHash);
  const gasPrice = BigInt(tx.gasPrice);

  await transactionService.createTransaction({
    contractAddress: event.address,
    transactionHash: event.transactionHash,
    blockHash: event.blockHash,
    blockNumber: event.blockNumber.toString(),
    eventName: event.event,
    amount: amount.toString(),
    date,
    gasPrice: gasPrice.toString(),
    gasUsed: gasUsed.toString(),
    spender: user,
    blockTimeStamp: blockTimeStamp.toString(),
    synchronize: synchronize.id,
  });
};

const handleWithdrawEvent = async (
  event,
  returnValues,
  blockTimeStamp,
  synchronize
) => {
  const { user, amount, reward, timestamp } = returnValues;
  const withdrawDate = new Date(Number(timestamp) * 1000);

  const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
  const gasUsed = receipt.gasUsed.toString();

  const tx = await web3.eth.getTransaction(event.transactionHash);
  const gasPrice = BigInt(tx.gasPrice).toString();

  await transactionService.createTransaction({
    contractAddress: event.address,
    transactionHash: event.transactionHash,
    blockHash: event.blockHash,
    blockNumber: event.blockNumber.toString(),
    eventName: event.event,
    amount: amount.toString(),
    reward: reward.toString(),
    date: withdrawDate,
    spender: user,
    blockTimeStamp: blockTimeStamp.toString(),
    synchronize: synchronize.id,
    gasUsed,
    gasPrice,
  });
};

const handleMintNFTEvent = async (
  event,
  returnValues,
  blockTimeStamp,
  synchronize
) => {
  const { user, tokenId } = returnValues;

  const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
  const gasUsed = receipt.gasUsed.toString();

  const tx = await web3.eth.getTransaction(event.transactionHash);
  const gasPrice = BigInt(tx.gasPrice).toString();

  await transactionService.createTransaction({
    contractAddress: event.address,
    transactionHash: event.transactionHash,
    blockHash: event.blockHash,
    blockNumber: event.blockNumber.toString(),
    eventName: event.event,
    sender: user,
    tokenId: tokenId.toString(),
    blockTimeStamp: blockTimeStamp.toString(),
    synchronize: synchronize.id,
    gasUsed,
    gasPrice,
  });
};

module.exports = { handleLogicEvents };
