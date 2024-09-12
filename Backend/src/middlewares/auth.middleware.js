const jwt = require("jsonwebtoken");
const authenticateToken = (req, res, next) => {
  const accessToken = req.signedCookies?.accessToken;
  if (!accessToken) {
    return res
      .status(401)
      .json({ message: "No token provided, please login." });
  }
  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token, access denied." });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
