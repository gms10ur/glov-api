const functions = require("firebase-functions");
import express = require("express");
import morgan = require("morgan");
const cors = require("cors");
const app = express();
app.disable("x-powered-by");

const streamRouter = require("./routes/stream");

app.use(morgan("dev"));
app.use(cors({ origin: true }));
app.use(express.json());
app.use("/stream", streamRouter);

module.exports = functions.https.onRequest(app);
