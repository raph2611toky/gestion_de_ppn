const { ValidationError, Op } = require("sequelize");
const db = require("../models");
const Helper = require('../../config/helper');

// Main models
const Ppn = db.Ppn;
const Employe = db.Employe;

// Allowed measurement units
const VALID_UNITS = ['KG', 'GRAMME', 'LITRE', 'SAC', 'KP'];

// Format PPN data
const formatPpn = (ppn) => ({
    id_ppn: ppn.id_ppn,
    unite_mesure_unitaire: ppn.unite_mesure_unitaire,
    unite_mesure_gros: ppn.unite_mesure_gros,
    observation: ppn.observation,
    description: ppn.description,
    nom_ppn: ppn.nom_ppn,
    employe_id: ppn.employe_id,
    employe: ppn.ppns_employe ? {
        id_employe: ppn.ppns_employe.id_employe_employe,
        cin: ppn.ppns_employe.cin,
        nom: ppn.ppns_employe.nom,
        email: ppn.ppns_employe.email,
        region: ppn.ppns_employe.region,
        fonction: ppn.ppns_employe.fonction
    } : null
});

// 1 - Create PPN
const addPpn = async (req, res) => {
    try {
        if (!req.employe || !req.employe.id_employe) {
            return Helper.send_res(res, { erreur: 'Utilisateur non authentifié.' }, 401);
        }

        let { unite_mesure_unitaire, unite_mesure_gros, observation, description, nom_ppn } = req.body;
        const employe_id = req.employe.id_employe;

        // Validate required fields
        if (!nom_ppn) {
            return Helper.send_res(res, { erreur: 'Le champ nom_ppn est requis.' }, 400);
        }

        // Validate measurement units if provided
        if (unite_mesure_unitaire && !VALID_UNITS.includes(unite_mesure_unitaire)) {
            return Helper.send_res(res, { erreur: 'Unité de mesure unitaire invalide.' }, 400);
        }
        if (unite_mesure_gros && !VALID_UNITS.includes(unite_mesure_gros)) {
            return Helper.send_res(res, { erreur: 'Unité de mesure gros invalide.' }, 400);
        }

        // Check for duplicate PPN based on nom_ppn
        let existingPpn = await Ppn.findOne({
            where: { nom_ppn }
        });

        if (existingPpn) {
            return Helper.send_res(res, { erreur: 'Un PPN avec cette nom_ppn existe déjà.' }, 400);
        }

        let info = { unite_mesure_unitaire, unite_mesure_gros, observation, description, nom_ppn, employe_id };
        const ppn_created = await Ppn.create(info);
        const createdPpn = await Ppn.findOne({
            where: { id_ppn: ppn_created.id_ppn },
            include: [{
                model: Employe,
                as: 'ppns_employe'
            }]
        });
        return Helper.send_res(res, formatPpn(createdPpn), 201);
    } catch (err) {
        console.error(err);
        const message = `Impossible de créer ce PPN ! Réessayez dans quelques instants.`;
        return Helper.send_res(res, { erreur: message }, 400);
    }
};

// 2 - Get All PPNs
const getAllPpn = async (req, res) => {
    try {
        const search = req.params.nom_ppn;
        let ppns;

        if (search) {
            ppns = await Ppn.findAll({
                where: {
                    [Op.or]: [
                        { unite_mesure_unitaire: { [Op.like]: `%${search}%` } },
                        { unite_mesure_gros: { [Op.like]: `%${search}%` } },
                        { observation: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { nom_ppn: { [Op.like]: `%${search}%` } },
                    ]
                },
                include: [{
                    model: Employe,
                    as: 'ppns_employe'
                }],
                order: [['nom_ppn', 'ASC']],
                limit: 50
            });
        } else {
            ppns = await Ppn.findAll({
                include: [{
                    model: Employe,
                    as: 'ppns_employe'
                }],
                order: [['id_ppn', 'DESC']]
            });
        }

        const formattedPpns = ppns.map(formatPpn);
        return Helper.send_res(res, formattedPpns);
    } catch (err) {
        console.error(err);
        const message = `Impossible de récupérer la liste des PPNs ! Réessayez dans quelques instants.`;
        return Helper.send_res(res, { erreur: message }, 400);
    }
};

// 3 - Get One PPN
const getOnePpn = async (req, res) => {
    try {
        const id_ppn = req.params.id_ppn;
        if (!id_ppn || isNaN(id_ppn)) {
            return Helper.send_res(res, { erreur: 'L\'identifiant est non précisé ou invalide.' }, 400);
        }
        const ppn = await Ppn.findOne({
            where: { id_ppn },
            include: [{
                model: Employe,
                as: 'ppns_employe'
            }]
        });
        if (!ppn) {
            const message = `Impossible de récupérer ce PPN, essayez avec une autre identification.`;
            return Helper.send_res(res, { erreur: message }, 404);
        }
        return Helper.send_res(res, formatPpn(ppn));
    } catch (err) {
        console.error(err);
        const message = `Impossible de récupérer ce PPN ! Réessayez dans quelques instants.`;
        return Helper.send_res(res, { erreur: message }, 500);
    }
};

// 4 - Update PPN by ID
const updatePpn = async (req, res) => {
    try {
        const id_ppn = req.params.id_ppn;
        const { unite_mesure_unitaire, unite_mesure_gros, observation, description, nom_ppn, employe_id } = req.body;

        // Validate PPN existence
        const ppn = await Ppn.findOne({ where: { id_ppn } });
        if (!ppn) {
            return Helper.send_res(res, { erreur: 'PPN non trouvé.' }, 404);
        }

        // Validate measurement units if provided
        if (unite_mesure_unitaire && !VALID_UNITS.includes(unite_mesure_unitaire)) {
            return Helper.send_res(res, { erreur: 'Unité de mesure unitaire invalide.' }, 400);
        }
        if (unite_mesure_gros && !VALID_UNITS.includes(unite_mesure_gros)) {
            return Helper.send_res(res, { erreur: 'Unité de mesure gros invalide.' }, 400);
        }

        // Check for duplicate nom_ppn if provided
        if (nom_ppn && nom_ppn !== ppn.nom_ppn) {
            const existingPpn = await Ppn.findOne({
                where: {
                    nom_ppn,
                    id_ppn: { [Op.ne]: id_ppn }
                }
            });
            if (existingPpn) {
                return Helper.send_res(res, { erreur: 'Un PPN avec cette nom_ppn existe déjà.' }, 400);
            }
        }

        // Validate employe_id if provided
        if (employe_id) {
            const employe = await Employe.findOne({ where: { id_employe: employe_id } });
            if (!employe) {
                return Helper.send_res(res, { erreur: 'Employé non trouvé.' }, 404);
            }
        }

        const [updated] = await Ppn.update(
            {
                unite_mesure_unitaire: unite_mesure_unitaire !== undefined ? unite_mesure_unitaire : ppn.unite_mesure_unitaire,
                unite_mesure_gros: unite_mesure_gros !== undefined ? unite_mesure_gros : ppn.unite_mesure_gros,
                observation: observation !== undefined ? observation : ppn.observation,
                description: description || ppn.description,
                nom_ppn: nom_ppn || ppn.nom_ppn,
                employe_id: employe_id || ppn.employe_id
            },
            { where: { id_ppn } }
        );

        if (updated) {
            const updatedPpn = await Ppn.findOne({
                where: { id_ppn },
                include: [{
                    model: Employe,
                    as: 'ppns_employe'
                }]
            });
            return Helper.send_res(res, formatPpn(updatedPpn));
        }
        return Helper.send_res(res, { erreur: 'Aucune modification effectuée.' }, 400);
    } catch (err) {
        console.error(err);
        if (err instanceof ValidationError) {
            return Helper.send_res(res, { erreur: err.message }, 400);
        }
        const message = `Impossible de modifier ce PPN ! Réessayez dans quelques instants.`;
        return Helper.send_res(res, { erreur: message }, 500);
    }
};

// 5 - Delete PPN by ID
const deletePpn = async (req, res) => {
    try {
        const id_ppn = req.params.id_ppn;
        const ppn = await Ppn.findOne({ where: { id_ppn } });
        if (!ppn) {
            return Helper.send_res(res, { erreur: 'PPN non trouvé.' }, 404);
        }
        await Ppn.destroy({ where: { id_ppn } });
        return Helper.send_res(res, { message: "PPN supprimé avec succès." });
    } catch (err) {
        console.error(err);
        const message = `Impossible de supprimer ce PPN ! Réessayez dans quelques instants.`;
        return Helper.send_res(res, { erreur: message }, 500);
    }
};

module.exports = {
    addPpn,
    getAllPpn,
    getOnePpn,
    updatePpn,
    deletePpn
};