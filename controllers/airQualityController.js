const AirQuality = require('../models/Reading');

// Get all historical data
exports.getAllData = async (req, res) => {
    try {
        const data = await AirQuality.find().sort({ timestamp: -1 });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving data', error: error.message });
    }
};

// Get detailed report (analytics)
exports.getDetailedReport = async (req, res) => {
    try {
        const totalRecords = await AirQuality.countDocuments();
        const latestRecord = await AirQuality.findOne().sort({ timestamp: -1 });

        // Grouping by prediction inside payload
        const classificationCounts = await AirQuality.aggregate([
            { $group: { _id: "$payload.analysis.prediction", count: { $sum: 1 } } }
        ]);

        // Average levels using payload.sensors
        const averages = await AirQuality.aggregate([
            {
                $group: {
                    _id: null,
                    avgCo2: { $avg: "$payload.sensors.co2" },
                    avgPm25: { $avg: "$payload.sensors.pm25" },
                    avgTemp: { $avg: "$payload.sensors.temp" },
                    avgHum: { $avg: "$payload.sensors.hum" }
                }
            }
        ]);

        res.status(200).json({
            summary: {
                totalRecords,
                latestUpdate: latestRecord ? (latestRecord.payload?.timestamp || latestRecord.timestamp) : null,
                overallHealth: latestRecord ? latestRecord.payload?.analysis?.prediction : 'N/A'
            },
            analytics: {
                classifications: classificationCounts,
                globalAverages: averages[0] || {}
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

// Get data filtered by time range (e.g. ?start=2024-01-16&end=2024-01-17)
exports.getByRange = async (req, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ message: 'Both start and end dates are required' });
        }

        const query = {
            "payload.timestamp": {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        };

        const data = await AirQuality.find(query).sort({ timestamp: -1 });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error filtering by range', error: error.message });
    }
};


