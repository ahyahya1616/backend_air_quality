const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');

// URL: /api/setup-hardware
router.get('/setup-hardware', hardwareController.setupHardware);

// URL: /api/sensors (Smart Health Check)
router.get('/sensors', hardwareController.getSensors);

// URL: /api/actuators (Ventilation Dynamique)
router.get('/actuators', hardwareController.getActuators);

// URL: /api/sensors/history (Pour les graphiques)
router.get('/sensors/history', hardwareController.getHistory);

module.exports = router;
