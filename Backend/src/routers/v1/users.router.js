const router = require("express").Router();
const { usersController } = require("../../controllers");

router.get("/", usersController.getUsers);
router.get("/me", usersController.getUserInfo);
module.exports = router;
