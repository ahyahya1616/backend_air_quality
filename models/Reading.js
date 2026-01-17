const mongoose = require('mongoose');

// Définition stricte du schéma pour garantir la qualité des données
const ReadingSchema = new mongoose.Schema({
    payload: {
        timestamp: { type: Date },
        sensors: {
            co2: { type: Number },
            pm25: { type: Number },
            temp: { type: Number },
            hum: { type: Number }
        },
        analysis: {
            prediction: { type: String, default: 'Inconnu' },
            raw_value: { type: Number },
            probability: { type: Number },
            source: { type: String }
        }
    },
    _msgid: { type: String },
    timestamp: { type: Date, default: Date.now } // Date d'insertion côté backend
});

module.exports = mongoose.model('Reading', ReadingSchema, 'readings_v2');