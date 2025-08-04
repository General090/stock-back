// routes/dashboardRoutes.js
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboardStats, getRecentTransactions } = require("../controllers/dashboardController");

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", authMiddleware, getDashboardStats);

// GET /api/dashboard/recent
router.get("/recent", authMiddleware, getRecentTransactions);

module.exports = router;
