const { User } = require("../models");
const httpStatus = require("http-status");
const response = require("../utils/response");
const { Web3 } = require("web3");
const jwt = require("jsonwebtoken");

const web3 = new Web3(Web3.givenProvider);

const createAccessToken = (publicAddress) => {
  return jwt.sign({ publicAddress }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const createRefreshToken = (publicAddress) => {
  return jwt.sign({ publicAddress }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const login = async (req, res) => {
  try {
    const { publicAddress } = req.body;

    if (!publicAddress || publicAddress.trim() === "") {
      return res
        .status(400)
        .send({ message: "Public address is required and cannot be empty" });
    }

    let user = await User.findOne({ publicAddress });

    if (!user) {
      try {
        user = await User.create({
          publicAddress,
          nonce: Math.floor(Math.random() * 1000000),
        });
      } catch (error) {
        if (error.code === 11000) {
          return res
            .status(400)
            .send({ message: "User already exists with this public address" });
        }
        throw error;
      }
    }

    return res
      .status(httpStatus.OK)
      .json(response(httpStatus.OK, "User fetched or created", user));
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send({ message: "Server error" });
  }
};

const verify = async (req, res) => {
  try {
    const { publicAddress, signature } = req.body;
    console.log("signature", signature);

    console.log("OK");

    if (!publicAddress || !signature) {
      return res
        .status(400)
        .send({ message: "Public address and signature are required" });
    }

    const user = await User.findOne({ publicAddress });
    console.log("user", user);

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    const msg = `Nonce:${user.nonce}`;

    const signer = web3.eth.accounts.recover(msg, signature);
    console.log("signer", signer);
    if (signer.toLowerCase() === publicAddress.toLowerCase()) {
      user.nonce = Math.floor(Math.random() * 1000000);
      await user.save();

      const accessToken = createAccessToken(publicAddress);
      const refreshToken = createRefreshToken(publicAddress);

      res.cookie("accessToken", accessToken, { signed: true, httpOnly: true });
      res.cookie("refreshToken", refreshToken, {
        signed: true,
        httpOnly: true,
      });

      return res.status(200).json({ accessToken, refreshToken });
    } else {
      return res.status(401).json("Invalid signature");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json("Server error during verification");
  }
};

const getNonce = async (req, res) => {
  try {
    const { publicAddress } = req.body;

    if (!publicAddress) {
      return res.status(400).send({ message: "Public address is required" });
    }

    // Find or create the user
    let user = await User.findOne({ publicAddress });
    if (!user) {
      user = await User.create({
        publicAddress,
        nonce: Math.floor(Math.random() * 1000000),
      });
    }

    res.json({ nonce: user.nonce });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server error fetching nonce" });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.signedCookies?.refreshToken;
  if (!refreshToken) {
    return res
      .status(403)
      .json({ message: "Refresh token is missing, access denied." });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Invalid refresh token, access denied." });
    }

    const newAccessToken = createAccessToken(user.publicAddress);
    res.cookie("accessToken", newAccessToken, { signed: true, httpOnly: true });
    res.status(200).json({ accessToken: newAccessToken });
  });
};

module.exports = {
  login,
  verify,
  getNonce,
  refresh,
};
