require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const helmet = require("helmet");
const methodOverride = require("method-override");
const app = express();

const db = require("./src/config/db");
db.connect();

const {
  startSynchronizeDataFromSmartContract,
} = require("./src/utils/synchronize");

const port = process.env.PORT || 3000;

const router = require("./src/routers/v1");
app.use(
  cors({
    origin: process.env.URL_FE,
    credentials: true,
  })
);
app.use(methodOverride("_method"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    cookie: { maxAge: 6000000 },
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

// startSynchronizeDataFromSmartContract();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
