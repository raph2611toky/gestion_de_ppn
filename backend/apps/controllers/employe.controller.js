const { ValidationError, UniqueConstraintError, Op } = require("sequelize");
const db = require("../models");
const Helper = require('../../config/helper');
const {generateToken} = require('../../utils/securite/jwt')
const { sendOtpEmail, sendValidationEmail } = require('../../utils/email');

// :::: Creat main models :::: //
const Employe = db.Employe;
const Moderateur = db.Moderateur;
const OtpCode = db.OtpCode;

// :::: 1 - create Employe :::: //
const addEmploye = async (req, res) => {
    try {
        let { cin, nom, email, password, region } = req.body;

        if (!cin || !nom || !email || !password || !region) {
            return Helper.send_res(res, { erreur: "Champs obligatoires manquants" }, 400);
        }

        if (String(cin).length !== 12 || isNaN(cin)) {
            return Helper.send_res(res, { erreur: "CIN invalide (12 chiffres)" }, 400);
        }

        const existing = await Employe.findOne({ where: { [Op.or]: [{ cin }, { email }] } });
        if (existing) {
            return Helper.send_res(res, { message: "CIN ou email déjà utilisé" }, 409);
        }

        const hashedPassword = await Helper.encryptPassword(password);

        // Gérer uploads
        const photoPath = req.files?.photo ? req.files.photo[0].path : null;
        const facePath = req.files?.piece_identite_face ? req.files.piece_identite_face[0].path : null;
        const rectoPath = req.files?.piece_identite_recto ? req.files.piece_identite_recto[0].path : null;

        const employe = await Employe.create({
            cin,
            nom,
            email,
            password: hashedPassword,
            fonction: 'MODERATEUR',
            is_active: false,
            photo: photoPath,
        });

        // Création Moderateur
        await Moderateur.create({
            employe_id: employe.id_employe,
            region,
            piece_identite_face: facePath,
            piece_identite_recto: rectoPath,
            is_verified: false,
            is_validated: false,
        });

        // Génération OTP (inchangé)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        await OtpCode.create({
            employe_id: employe.id_employe,
            code,
            expires_at: expires,
            used: false
        });

        const emailSent = await sendOtpEmail(email, code, nom);
        if (!emailSent) {
            console.warn("Échec envoi email OTP");
        }

        return Helper.send_res(res, {
            message: "Compte créé. Vérifiez votre email pour activer.",
            employe_id: employe.id_employe
        }, 201);

    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: err.message || "Erreur serveur" }, 500);
    }
};

// :::: 2 - get all Employe :::: //
const getAllEmploye = async (req, res) => {
    try {
        const includeModerateur = req.query.withModerateur === 'true';

        let employes;

        if (req.query.nom) {
            const name = req.query.nom;
            employes = await Employe.findAndCountAll({
                where: {
                    nom: { [Op.like]: `%${name}%` },
                },
                include: includeModerateur ? [{
                    model: Moderateur,
                    as: 'moderateurDetails',
                    attributes: ['region', 'is_verified', 'is_validated']
                }] : [],
                order: [["cin"]],
                limit: 50,
            });
        } else {
            employes = await Employe.findAll({
                include: includeModerateur ? [{
                    model: Moderateur,
                    as: 'moderateurDetails',
                    attributes: ['region', 'is_verified', 'is_validated']
                }] : [],
                order: [["nom"]],
            });
        }

        // Optionnel : transformer les chemins en URLs absolues
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        employes.rows = employes.rows.map(emp => {
            const e = emp.toJSON();
            if (e.photo) e.photo = `${baseUrl}/${e.photo}`;
            if (e.moderateurDetails) {
                if (e.moderateurDetails.piece_identite_face) {
                    e.moderateurDetails.piece_identite_face = `${baseUrl}/${e.moderateurDetails.piece_identite_face}`;
                }
                if (e.moderateurDetails.piece_identite_recto) {
                    e.moderateurDetails.piece_identite_recto = `${baseUrl}/${e.moderateurDetails.piece_identite_recto}`;
                }
            }
            return e;
        });

        return Helper.send_res(res, employes);

    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: "Impossible de récupérer la liste des employés" }, 500);
    }
};

// :::: 3 - get one Employe :::: //
const getOneEmploye = async (req, res) => {
    try {
        console.log("get one employe");
        
        const employe_id = req.params.employe_id;
        if (!employe_id) {
            return Helper.send_res(res, 'L\'identifiant est non précisé.', 400);
        }
        const employe = await Employe.findOne({ where: { id_employe: employe_id } });
        console.log(employe);
        
        if (!employe) {
            const message = `Impossible de récupérer cet Employe, essayez avec une autre identification.`;
            return Helper.send_res(res, { erreur: message }, 404);
        }
        return Helper.send_res(res, employe);
    } catch (err) {
        console.error(err);
        const message = `Impossible de récupérer cet Employe ! Réessayez dans quelques instants.`;
        return Helper.send_res(res, { erreur: message }, 500);
    }
};

// :::: 3 - get one Employe :::: //
const getProfileEmploye = async (req, res) => {
    try {
        const employe_id = req.employe.id_employe;

        const employe = await Employe.findByPk(employe_id, {
            attributes: [
                'id_employe', 'cin', 'nom', 'email', 'photo', 
                'fonction', 'is_active', 'createdAt', 'updatedAt'
            ],
            include: [
                {
                    model: Moderateur,
                    as: 'moderateurDetails',
                    attributes: [
                        'region', 'piece_identite_face', 'piece_identite_recto',
                        'is_verified', 'is_validated'
                    ],
                    required: false  
                }
            ]
        });

        if (!employe) {
            return Helper.send_res(res, { message: "Profil non trouvé" }, 404);
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        const profile = {
            ...employe.toJSON(),
            photo: employe.photo ? `${baseUrl}/${employe.photo}` : null,
        };

        if (employe.fonction === 'MODERATEUR' && employe.moderateurDetails) {
            profile.moderateurDetails = {
                ...employe.moderateurDetails.toJSON(),
                piece_identite_face: employe.moderateurDetails.piece_identite_face
                    ? `${baseUrl}/${employe.moderateurDetails.piece_identite_face}`
                    : null,
                piece_identite_recto: employe.moderateurDetails.piece_identite_recto
                    ? `${baseUrl}/${employe.moderateurDetails.piece_identite_recto}`
                    : null,
            };
        }

        return Helper.send_res(res, profile);

    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: "Impossible de récupérer le profil" }, 500);
    }
};

// :::: 5 - update Employe by employe_id :::: //
const updateEmploye = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Si nouvelle photo
        if (req.file) {
            updateData.photo = req.file.path;
        }

        const [updated] = await Employe.update(updateData, { where: { id_employe: req.employe.id_employe } });
        if (updated) {
            const updatedEmploye = await Employe.findOne({ where: { id_employe: req.employe.id_employe } });
            return Helper.send_res(res, updatedEmploye);
        }
        throw new Error('Employe not found');
    } catch (err) {
        console.error(err);
        if (err instanceof ValidationError) {
            return Helper.send_res(res, { erreur: err.message }, 400);
        }
        const message = `Impossible de modifier cet Employe ! Réessayez dans quelques instants.`;
        return Helper.send_res(res, { erreur: message }, 500);
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { employe_id, code } = req.body;

        if (!employe_id || !code) {
            return Helper.send_res(res, { erreur: "employe_id et code requis" }, 400);
        }

        const employe = await Employe.findByPk(employe_id);
        if (!employe || employe.fonction !== 'MODERATEUR') {
            return Helper.send_res(res, { erreur: "Employé non trouvé ou non modérateur" }, 404);
        }

        const otp = await OtpCode.findOne({
            where: {
                employe_id,
                code,
                used: false,
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (!otp) {
            return Helper.send_res(res, { erreur: "Code invalide ou expiré" }, 400);
        }

        // Mettre à jour Moderateur
        const moderateur = await Moderateur.findOne({ where: { employe_id } });
        if (moderateur) {
            await moderateur.update({ is_verified: true });
        }

        // Supprimer l'OTP (ou tous les OTPs expirés/usés, mais ici supprimer celui-ci)
        await otp.destroy();

        return Helper.send_res(res, { message: "Email vérifié avec succès. En attente de validation admin." }, 200);

    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: "Erreur lors de la vérification" }, 500);
    }
};

const getPendingModerators = async (req, res) => {
    try {
        const pending = await Employe.findAll({
            where: {
                fonction: 'MODERATEUR'
            },
            include: [{
                model: Moderateur,
                as: 'moderateurDetails',
                where: { is_validated: false },
                required: true
            }]
        });
        const validated = await Employe.findAll({
            where: {
                fonction: 'MODERATEUR'
            },
            include: [{
                model: Moderateur,
                as: 'moderateurDetails',
                where: { is_validated: false },
                required: true
            }]
        });

        return Helper.send_res(res, {pending, validated});
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: "Erreur récupération liste" }, 500);
    }
};

// Nouvelle: getPendingModeratorDetails
const getPendingModeratorDetails = async (req, res) => {
    try {
        const id = req.params.id;

        const moderator = await Employe.findByPk(id, {
            where: {
                fonction: 'MODERATEUR',
                is_active: false
            },
            include: [{ model: Moderateur, as: 'moderateurDetails' }]
        });

        if (!moderator || moderator.moderateurDetails.is_validated) {
            return Helper.send_res(res, { erreur: "Modérateur non trouvé ou déjà validé" }, 404);
        }

        return Helper.send_res(res, moderator);
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: "Erreur récupération détails" }, 500);
    }
};

// Nouvelle: validateModerator
const validateModerator = async (req, res) => {
    try {
        const id = req.params.id;

        const employe = await Employe.findByPk(id);
        if (!employe || employe.fonction !== 'MODERATEUR' || employe.is_active) {
            return Helper.send_res(res, { erreur: "Modérateur non trouvé ou déjà actif" }, 404);
        }

        const moderateur = await Moderateur.findOne({ where: { employe_id: id } });
        if (!moderateur || !moderateur.is_verified) {
            return Helper.send_res(res, { erreur: "Modérateur non vérifié ou non trouvé" }, 400);
        }

        // Valider
        await moderateur.update({ is_validated: true });

        const emailSent = await sendValidationEmail(employe.email, employe.nom);
        if (!emailSent) {
            console.warn("Échec envoi email validation");
        }

        return Helper.send_res(res, { message: "Modérateur validé avec succès" }, 200);

    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: "Erreur lors de la validation" }, 500);
    }
};


const rejectModerator = async (req, res) => {
    try {
        const id = req.params.id;

        const employe = await Employe.findByPk(id);
        if (!employe || employe.fonction !== 'MODERATEUR' || employe.is_active) {
            return Helper.send_res(res, { erreur: "Modérateur non trouvé ou déjà actif" }, 404);
        }

        const moderateur = await Moderateur.findOne({ where: { employe_id: id } });
        if (!moderateur || !moderateur.is_verified) {
            return Helper.send_res(res, { erreur: "Modérateur non vérifié ou non trouvé" }, 400);
        }

        // Rejeter
        await moderateur.update({ is_validated: false });

        const emailSent = await sendValidationEmail(employe.email, employe.nom);
        if (!emailSent) {
            console.warn("Échec envoi email validation");
        }

        return Helper.send_res(res, { message: "Modérateur rejeté avec succès" }, 200);

    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: "Erreur lors du rejet" }, 500);
    }
};

// :::: 6 - delete Employe by employe_id :::: //
const deleteEmploye = async (req, res) => {
    try {
        const employe_id = req.params.employe_id;
        const deleted = await Employe.destroy({ where: { id_employe: employe_id } });
        if (deleted) {
            return Helper.send_res(res, { message: "Employe supprimé avec succès." });
        }
        throw new Error('Employe not found');
    } catch (err) {
        console.error(err);
        const message = `Impossible de supprimer cet Employe ! Réessayez dans quelques instants.`;
        return Helper.send_res(res, { erreur: message }, 500);
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const employe = await Employe.findOne({ where: { email } });
        if (!employe) {
            return Helper.send_res(res, { message: "Utilisateur non trouvé" }, 404);
        }

        const isPasswordValid = await Helper.checkPassword(password, employe.password);
        if (!isPasswordValid) {
            return Helper.send_res(res, { message: "Mot de passe incorrect" }, 401);
        }

        if (employe.fonction !== 'ADMINISTRATEUR') {
            return Helper.send_res(res, { message: "Accès réservé aux administrateurs" }, 403);
        }

        await employe.update({ is_active: true });

        const employeData = { employe_id: employe.id_employe };
        const token = generateToken(employeData);
        return Helper.send_res(res, { token, fonction: employe.fonction }, 200);
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        return Helper.send_res(res, { message: "Erreur lors de la connexion" }, 500);
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const employe = await Employe.findOne({ where: { email } });
        if (!employe) {
            return Helper.send_res(res, { message: "Utilisateur non trouvé" }, 404);
        }

        const isPasswordValid = await Helper.checkPassword(password, employe.password);
        if (!isPasswordValid) {
            return Helper.send_res(res, { message: "Mot de passe incorrect" }, 401);
        }

        if (employe.fonction !== 'MODERATEUR') {
            return Helper.send_res(res, { message: "Accès réservé aux modérateurs" }, 403);
        }

        
        // Pour modérateur, inclure region de Moderateur
        let region = null;
        if (employe.fonction === 'MODERATEUR') {
            const moderateur = await Moderateur.findOne({ where: { employe_id: employe.id_employe } });
            if (moderateur) region = moderateur.region;
            if (!moderateur.is_verified) {
                return Helper.send_res(res, { message: "Compte non vérifié" }, 403);
            }
            if (!moderateur.is_validated) {
                return Helper.send_res(res, { message: "Compte non validé" }, 403);
            }
        }
        await employe.update({ is_active: true });
        
        const employeData = { employe_id: employe.id_employe };
        const token = generateToken(employeData);
        return Helper.send_res(res, { token, fonction: employe.fonction, region }, 200);
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        return Helper.send_res(res, { message: "Erreur lors de la connexion" }, 500);
    }
};

const logout = async (req, res) => {
    try {
        const employe = req.employe;
        if (!employe) {
            return Helper.send_res(res, { erreur: "Utilisateur non authentifié" }, 401);
        }
        await employe.update({ is_active: false });
        return Helper.send_res(res, { message: "Déconnexion réussie" }, 200);
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: "Erreur lors de la déconnexion" }, 500);
    }
};

module.exports = {
    addEmploye,
    getAllEmploye,
    getOneEmploye,
    updateEmploye,
    deleteEmploye,
    login,loginAdmin,
    getProfileEmploye,
    verifyOtp,
    getPendingModerators,
    getPendingModeratorDetails,
    validateModerator,rejectModerator,
    logout,
};
