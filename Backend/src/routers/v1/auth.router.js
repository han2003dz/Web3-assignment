const router = require("express").Router();
const { authController } = require("../../controllers");
router.post("/login", authController.login);
router.post("/verify", authController.verify);
router.get("/refresh", authController.refresh);
module.exports = router;
