const express = require('express');
const router = express.Router();
const airQualityController = require('../controllers/airQualityController');

// GET /api/air-quality - History for Dashboard
router.get('/', airQualityController.getAllData);

// GET /api/air-quality/report - Detailed analytics for the frontend
router.get('/report', airQualityController.getDetailedReport);

// GET /api/air-quality/range - Filter by date range (?start=...&end=...)
router.get('/range', airQualityController.getByRange);

module.exports = router;
