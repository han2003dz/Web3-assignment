const { Web3 } = require("web3");
const cron = require("node-cron");
const { synchronizeService, transactionService } = require("../services");
const contractLogic = require("../contracts/Logic.json");
const contractAddress = require("../contracts/contract-address.json");
const { handleLogicEvents } = require("../helpers/handleLogicEvents");

const providerURL = process.env.NETWORK_RPC;
const web3 = new Web3(providerURL);

const logicContract = new web3.eth.Contract(
  contractLogic.abi,
  contractAddress.Logic
);
let isJobRunning = false;
const onJobGetDataFromSmartContract = async () => {
  try {
    const currentBlock = await web3.eth.getBlockNumber();
    const lastSynchronized = await synchronizeService.getLastSynchronize();
    const lastBlockSynchronized = lastSynchronized
      ? lastSynchronized.toBlock + 1
      : parseInt(process.env.START_BLOCK, 10);
    const lastBlockOnchain = Math.min(
      Number(currentBlock),
      lastBlockSynchronized + 1000
    );

    console.log(
      `Synchronizing blocks from ${lastBlockSynchronized} to ${lastBlockOnchain}`
    );
    await synchronizeDataFromBlock(lastBlockSynchronized, lastBlockOnchain);
  } catch (error) {
    console.error("Error in job:", error);
  }
};

const synchronizeDataFromBlock = async (startBlock, endBlock) => {
  try {
    const config = { fromBlock: startBlock, toBlock: endBlock };
    const synchronize = await synchronizeService.createSynchronize(config);

    const listEvents = await logicContract.getPastEvents("allEvents", config);

    const sortedEvents = listEvents.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );

    for (const event of sortedEvents) {
      const block = await web3.eth.getBlock(event.blockNumber);
      event.blockTimeStamp = block.timestamp;
      await handleLogicEvents(event, block.timestamp, synchronize);
    }
  } catch (error) {
    console.error("Synchronization error:", error);
  }
};

const startSynchronizeDataFromSmartContract = () => {
  cron.schedule("*/6 * * * * *", async () => {
    console.log("OK", isJobRunning);
    if (isJobRunning) {
      console.warn("Previous job is still running. Skipping this schedule.");
      return;
    }

    isJobRunning = true;
    try {
      await onJobGetDataFromSmartContract();
    } catch (error) {
      console.error("Error during synchronization job:", error);
    } finally {
      isJobRunning = false;
    }
  });
};

module.exports = { startSynchronizeDataFromSmartContract };
