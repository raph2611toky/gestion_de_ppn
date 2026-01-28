const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const getMonthByNumber = (month_number) => {
    try {
        if (month_number > 12 || 0 > month_number ){
            return None
        }
        const numbers_month = ['Janvier','Février', 'Mars', 'Avril', 'May', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        return numbers_month[month_number-1]
    } catch (error) {
        throw new Error('Nombre invalide de mois');
    }
}

module.exports = {
    send_res(res, json_response, status = 200) {
        return res.status(status).send(json_response);
    },
    async encryptPassword(password, saltRounds = 10) {
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (err) {
            console.error('Erreur lors du cryptage du mot de passe :', err);
            throw err; // Ajout pour gérer les erreurs correctement
        }
    },
    async checkPassword(plainPassword, hashedPassword) {
        try {
            const match = await bcrypt.compare(plainPassword, hashedPassword);
            return match;
        } catch (err) {
            console.error('Erreur lors de la vérification du mot de passe :', err);
            throw err; // Ajout pour gérer les erreurs correctement
        }
    },
    getMonthByNumber,
};
