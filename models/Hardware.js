const mongoose = require('mongoose');

const HardwareSchema = new mongoose.Schema({
    name: { type: String, required: true }, // ex: "CO2 Alpha-1"
    type: { type: String, enum: ['sensor', 'actuator'], required: true },
    functionality: { type: String, required: true }, // ex: 'co2', 'temp', 'ventilation'
    status: { type: String, enum: ['working', 'broken'], default: 'working' },
    last_maintenance: { type: Date, default: Date.now },
    state: { type: String, default: 'OFF' }
});

module.exports = mongoose.model('Hardware', HardwareSchema);
