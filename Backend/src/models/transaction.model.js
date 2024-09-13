const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const transactionSchema = mongoose.Schema(
  {
    contractAddress: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
    },
    blockHash: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: String,
      required: true,
    },
    eventName: {
      type: String,
      required: true,
      enum: ["Deposit", "Withdraw", "MintNFT"],
    },
    amount: {
      type: String,
    },
    nftCount: {
      type: Number,
    },
    interest: {
      type: String,
    },
    spender: {
      type: String,
      // required: true,
    },
    receiver: {
      type: String,
    },
    tokenId: {
      type: String,
    },
    blockTimeStamp: {
      type: String,
      required: true,
    },
    gasUsed: {
      type: String,
      default: null,
    },
    gasPrice: {
      type: String,
    },
    synchronize: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Synchronize",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
