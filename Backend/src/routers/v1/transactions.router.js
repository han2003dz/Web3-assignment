const router = require("express").Router();
const authenticateToken = require("../../middlewares/auth.middleware");
const { transactionsController } = require("../../controllers");

router.get("/", authenticateToken, transactionsController.getTransactions);
module.exports = router;
