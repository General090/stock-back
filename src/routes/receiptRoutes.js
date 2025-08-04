const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { processSale } = require("../controllers/receiptController.js");

const router = express.Router();

router.post("/", authMiddleware, processSale);

module.exports = router;
