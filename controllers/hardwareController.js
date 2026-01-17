const Hardware = require('../models/Hardware');
const Reading = require('../models/Reading');

// 1. INITIALISATION (A lancer une fois pour créer l'inventaire)
// URL: http://localhost:5000/api/setup-hardware
exports.setupHardware = async (req, res) => {
    const devices = [
        // --- SENSORS ---
        { name: "Indus-CO2-01", type: "sensor", functionality: "co2" },
        { name: "Laser-PM25-X", type: "sensor", functionality: "pm25" },
        { name: "Thermo-Core-A", type: "sensor", functionality: "temperature" },
        { name: "Hydro-Sense-V2", type: "sensor", functionality: "humidity" },

        // --- ACTUATOR ---
        { name: "Ventilation Principale", type: "actuator", functionality: "ventilation" }
    ];

    try {
        await Hardware.deleteMany({}); // On vide l'ancien inventaire
        await Hardware.insertMany(devices);
        res.json({ success: true, message: "Inventaire Hardware réinitialisé !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. ETAT DES CAPTEURS (Smart Health Check)
exports.getSensors = async (req, res) => {
    try {
        // A. On récupère la liste des capteurs
        let sensors = await Hardware.find({ type: 'sensor' }).lean();

        // B. On récupère la DERNIÈRE lecture enregistrée par Node-RED
        const lastReading = await Reading.findOne().sort({ timestamp: -1 });

        // C. Vérification : Est-ce que le système est "Vivant" ?
        const now = new Date();
        // Si aucune donnée ou donnée vieille de plus de 60 secondes -> Système Down
        const isSystemDown = !lastReading || (now - new Date(lastReading.timestamp) > 60000);

        // D. Mise à jour du statut pour le Frontend
        sensors = sensors.map(s => {
            if (isSystemDown) {
                s.status = 'broken'; // Affiche rouge si Node-RED ne répond plus
            } else {
                s.status = 'working'; // Affiche vert sinon
            }
            return s;
        });

        res.json({ success: true, data: sensors });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. ETAT DES ACTUATEURS (Ventilation Dynamique)
exports.getActuators = async (req, res) => {
    try {
        let actuators = await Hardware.find({ type: 'actuator' }).lean();
        const lastReading = await Reading.findOne().sort({ timestamp: -1 });

        actuators = actuators.map(actuator => {
            if (actuator.functionality === 'ventilation') {
                // Si la dernière prédiction est "Polluted", le ventilo est ON
                // On vérifie dans payload ou racine pour compatibilité
                const prediction = lastReading?.payload?.analysis?.prediction || lastReading?.analysis?.prediction;

                // Si la dernière prédiction existe ET est 'Polluted'
                if (prediction === 'Polluted') {
                    actuator.status = 'working'; // En bon état
                    actuator.pumpState = 'ON';   // En marche (Pour l'animation React)
                } else {
                    actuator.status = 'working';
                    actuator.pumpState = 'OFF';  // A l'arrêt
                }
            }
            return actuator;
        });

        res.json({ success: true, data: actuators });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 4. HISTORIQUE (Pour les graphiques)
exports.getHistory = async (req, res) => {
    try {
        // On renvoie les 20 derniers points pour les courbes
        const history = await Reading.find()
            .sort({ timestamp: -1 })
            .limit(20);

        res.json({ success: true, data: history }); // .reverse() sera fait côté front si besoin
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
