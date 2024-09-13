const { transactionService } = require("../services");
const httpStatus = require("http-status");
const response = require("../utils/response");
const getTransactions = async (req, res) => {
  try {
    const result = await transactionService.queryTransactions(req.query);
    res
      .status(httpStatus.OK)
      .json(response(httpStatus.OK, "Successfully", result));
  } catch (error) {
    console.log("error", error);
  }
};

const getTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const result = await transactionService.getTransactionById(transactionId);
    res
      .status(httpStatus.OK)
      .json(
        response(httpStatus.OK, "get transaction by id successfully", result)
      );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
};
