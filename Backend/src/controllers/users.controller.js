const User = require("../models/user.model");
const httpStatus = require("http-status");
const response = require("../utils/response");
const jwt = require("jsonwebtoken");
const getUsers = async (req, res) => {
  try {
    const listUsers = await User.find();
    return res
      .status(200)
      .json(response(httpStatus.OK, "Successfully", listUsers));
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error" });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const token = req.signedCookies?.accessToken;
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { publicAddress } = decoded;
    const user = await User.findOne({ publicAddress });
    console.log("user", user);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    return res.status(200).json(
      response(httpStatus.OK, "Successfully", {
        userId: user._id,
        publicAddress: user.publicAddress,
      })
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error" });
  }
};

module.exports = {
  getUsers,
  getUserInfo,
};
