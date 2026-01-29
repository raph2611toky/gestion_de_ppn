const {verifyToken} = require('../utils/securite/jwt');
const User = require('../apps/models/employe');
const db = require("../apps/models/index");
const Employe = db.Employe;

module.exports.IsAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Pas de token fourni.' });

    try {
        const decoded = verifyToken(token);
        
        const employe = await Employe.findOne({ where: { id_employe: decoded.employe_id } });
        if (!employe) {
            return res.status(401).json({ message: 'Employé non trouvé.' });
        }

        if (employe.fonction !== 'ADMINISTRATEUR' && employe.fonction !== 'MODERATEUR') {
            return res.status(401).json({ message: 'Token non autorisé.' });
        }
        if (!employe?.is_active) {
            return res.status(403).json({ message: 'Compte non encore activé / validé' });
        }

        req.employe = employe;
        next();
    } catch (err) {
        console.error('Authentication Error:', err);
        return res.status(401).json({ message: 'Token invalide.' });
    }
};

module.exports.IsAuthenticatedAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Pas de token fourni.' });

    try {
        const decoded = verifyToken(token);
        console.log('Decoded JWT:', decoded);
        
        const employe = await Employe.findOne({ where: { id_employe: decoded.employe_id } });
        if (!employe) {
            return res.status(401).json({ message: 'Employé non trouvé.' });
        }

        if (employe.fonction !== 'ADMINISTRATEUR') {
            return res.status(401).json({ message: 'Token non autorisé.' });
        }

        if (!employe?.is_active) {
            return res.status(403).json({ message: 'Compte non encore activé / validé' });
        }

        req.employe = employe;
        next();
    } catch (err) {
        console.error('Admin Authentication Error:', err);
        return res.status(401).json({ message: 'Token invalide.' });
    }
};
