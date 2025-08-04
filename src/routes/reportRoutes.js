const express = require("express");
const { getStockSummary } = require("../controllers/stockReportController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stock-summary",authenticate, getStockSummary);

module.exports = router;
