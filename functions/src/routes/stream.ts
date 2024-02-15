import express = require("express");
const authMw = require("../middlewares/authMw");
const streamController = require("../controllers/streamController");

const router = express.Router();

router.get("/getHello", authMw, streamController.getHello);
router.post("/", authMw, streamController.getStream);

module.exports = router;
