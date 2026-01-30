const { Op, where } = require("sequelize");
const db = require("../models");
const Helper = require('../../config/helper');
const moment = require('moment');

// Main models
const Rapport = db.Rapport;
const Ppn = db.Ppn;
const Employe = db.Employe;

// Format report data
const formatRapport = (rapport) => ({
    id_rapport: rapport.id_rapport,
    ppn_id: rapport.ppn_id,
    employe_id: rapport.employe_id,
    prix_unitaire_min: parseFloat(rapport.prix_unitaire_min).toFixed(2),
    prix_unitaire_max: parseFloat(rapport.prix_unitaire_max).toFixed(2),
    prix_gros_min: parseFloat(rapport.prix_gros_min).toFixed(2),
    prix_gros_max: parseFloat(rapport.prix_gros_max).toFixed(2),
    district: rapport.district,
    observation: rapport.observation,
    date: moment(rapport.date).format('YYYY-MM-DD HH:mm:ss'),
    created_at: moment(rapport.created_at).format('YYYY-MM-DD HH:mm:ss'),
    ppn: rapport.ppn ? {
        id_ppn: rapport.ppn.id_ppn,
        nom_ppn: rapport.ppn.nom_ppn,
        unite_prix: rapport.ppn.unite_prix,
        unite_mesure: rapport.ppn.unite_mesure,
        description: rapport.ppn.description,
        employe_id: rapport.ppn.employe_id
    } : null,
    employe: rapport.employe ? {
        id_employe: rapport.employe.id_employe_employe,
        cin: rapport.employe.cin,
        nom: rapport.employe.nom,
        email: rapport.employe.email,
        region: rapport.employe.region,
        fonction: rapport.employe.fonction
    } : null
});

const formatRapportSimple = (rapport) => ({
    id_rapport: rapport.id_rapport,
    ppn_id: rapport.ppn_id,
    employe_id: rapport.employe_id,
    prix_unitaire_min: parseFloat(rapport.prix_unitaire_min).toFixed(2),
    prix_unitaire_max: parseFloat(rapport.prix_unitaire_max).toFixed(2),
    prix_gros_min: parseFloat(rapport.prix_gros_min).toFixed(2),
    prix_gros_max: parseFloat(rapport.prix_gros_max).toFixed(2),
    district: rapport.district,
    observation: rapport.observation,
    date: moment(rapport.date).format('YYYY-MM-DD HH:mm:ss'),
    created_at: moment(rapport.created_at).format('YYYY-MM-DD HH:mm:ss'),
    ppn: rapport.ppn ? {
        id_ppn: rapport.ppn.id_ppn,
        nom_ppn: rapport.ppn.nom_ppn,
        unite_mesure_unitaire: rapport.ppn.unite_mesure_unitaire,
        unite_mesure_gros: rapport.ppn.unite_mesure_gros,
        observation: rapport.ppn.observation,
        description: rapport.ppn.description,
        employe_id: rapport.ppn.employe_id
    } : null
});

const getUsersWithRapports = async (req, res) => {
    try {

        if (req.employe.fonction !== 'ADMINISTRATEUR') {
            return Helper.send_res(res, { erreur: 'Accès réservé aux administrateurs.' }, 403);
        }

        const employes = await Employe.findAll({
            where: { fonction:'MODERATEUR' },
            include: [
                {
                    model: Rapport,
                    as: 'rapports',
                    include: [
                        { model: Ppn, as: 'ppn' }
                    ],
                    order: [['created_at', 'DESC']],
                }
            ],
            order: [['id_employe', 'ASC']]
        });

        const formatted = employes.map(e => ({
            id_employe: e.id_employe,
            cin: e.cin,
            nom: e.nom,
            email: e.email,
            region: e.region,
            fonction: e.fonction,
            rapports: e.rapports.map(formatRapport)
        }));

        return Helper.send_res(res, formatted);

    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: 'Impossible de récupérer les utilisateurs et leurs rapports.' }, 500);
    }
};

// 1 - List All Reports (Admin Only)
const getAllRapports = async (req, res) => {
    try {
        if (req.employe.fonction !== 'ADMINISTRATEUR') {
            return Helper.send_res(res, { erreur: 'Accès réservé aux administrateurs.' }, 403);
        }
        const rapports = await Rapport.findAll({
            include: [
                { model: Ppn, as: 'ppn' },
                { model: Employe, as: 'employe' }
            ],
            order: [['created_at', 'DESC']]
        });
        const formattedRapports = rapports.map(formatRapport);
        return Helper.send_res(res, formattedRapports);
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: 'Impossible de récupérer les rapports.' }, 500);
    }
};

// 2 - List My Reports
const getMyRapports = async (req, res) => {
    try {
        const rapports = await Rapport.findAll({
            where: { employe_id: req.employe.id_employe },
            include: [
                { model: Ppn, as: 'ppn' },
                { model: Employe, as: 'employe' }
            ],
            order: [['created_at', 'DESC']]
        });
        const formattedRapports = rapports.map(formatRapport);
        return Helper.send_res(res, formattedRapports);
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: 'Impossible de récupérer vos rapports.' }, 500);
    }
};

// 3 - Get One Report
const getOneRapport = async (req, res) => {
    try {
        const id_rapport = req.params.id_rapport;
        if (!id_rapport || isNaN(id_rapport)) {
            return Helper.send_res(res, { erreur: 'L\'identifiant du rapport est requis et doit être un nombre.' }, 400);
        }
        const rapport = await Rapport.findOne({
            where: { id_rapport },
            include: [
                { model: Ppn, as: 'ppn' },
                { model: Employe, as: 'employe' }
            ]
        });
        if (!rapport) {
            return Helper.send_res(res, { erreur: 'Rapport non trouvé.' }, 404);
        }
        return Helper.send_res(res, formatRapport(rapport));
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: 'Impossible de récupérer le rapport.' }, 500);
    }
};

// 4 - Search Reports
const searchRapports = async (req, res) => {
    try {
        const query = req.params.query;
        if (!query) {
            return Helper.send_res(res, { erreur: 'Terme de recherche requis.' }, 400);
        }
        const rapports = await Rapport.findAll({
            where: {
                [Op.or]: [
                    { '$ppn.nom_ppn$': { [Op.like]: `%${query}%` } },
                    { '$ppn.description$': { [Op.like]: `%${query}%` } },
                    { observation: { [Op.like]: `%${query}%` } },
                    { district: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                { model: Ppn, as: 'ppn' },
                { model: Employe, as: 'employe' }
            ],
            order: [['created_at', 'DESC']],
            limit: 50
        });
        const formattedRapports = rapports.map(formatRapport);
        return Helper.send_res(res, formattedRapports);
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: 'Impossible de rechercher les rapports.' }, 500);
    }
};

// 5 - Create Report
const addRapport = async (req, res) => {
    try {
        const { ppn_id, prix_unitaire_min, prix_unitaire_max, prix_gros_min, prix_gros_max, district, observation, date } = req.body;
        const employe_id = req.employe.id_employe;
        console.log(req.body);

        // Validate required fields
        if (!ppn_id || !prix_unitaire_min || !prix_unitaire_max || !prix_gros_min || !prix_gros_max || !district) {
            return Helper.send_res(res, { erreur: 'Les champs ppn_id, prix_unitaire_min, prix_unitaire_max, prix_gros_min, prix_gros_max et district sont requis.' }, 400);
        }

        // Validate numeric fields
        const prices = [prix_unitaire_min, prix_unitaire_max, prix_gros_min, prix_gros_max];
        if (prices.some(p => isNaN(p) || p < 0)) {
            return Helper.send_res(res, { erreur: 'Les prix doivent être des nombres positifs.' }, 400);
        }

        // Validate PPN
        const ppn = await Ppn.findOne({ where: { id_ppn: ppn_id } });
        if (!ppn) {
            return Helper.send_res(res, { erreur: 'PPN non trouvé.' }, 404);
        }

        // Validate date if provided
        const rapportDate = date ? new Date(date) : new Date();
        if (date && isNaN(rapportDate.getTime())) {
            return Helper.send_res(res, { erreur: 'Date invalide.' }, 400);
        }

        const rapport = await Rapport.create({
            ppn_id,
            employe_id,
            prix_unitaire_min,
            prix_unitaire_max,
            prix_gros_min,
            prix_gros_max,
            district,
            observation,
            date: rapportDate,
            created_at: new Date()
        });

        const createdRapport = await Rapport.findOne({
            where: { id_rapport: rapport.id_rapport },
            include: [
                { model: Ppn, as: 'ppn' },
                { model: Employe, as: 'employe' }
            ]
        });

        return Helper.send_res(res, formatRapport(createdRapport), 201);
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: 'Impossible de créer le rapport.' }, 400);
    }
};

// 6 - Update Report
const updateRapport = async (req, res) => {
    try {
        const id_rapport = req.params.id_rapport;
        const { ppn_id, prix_unitaire_min, prix_unitaire_max, prix_gros_min, prix_gros_max, district, observation, date } = req.body;

        const rapport = await Rapport.findOne({ where: { id_rapport } });
        if (!rapport) {
            return Helper.send_res(res, { erreur: 'Rapport non trouvé.' }, 404);
        }
        if (rapport.employe_id !== req.employe.id_employe) {
            return Helper.send_res(res, { erreur: 'Vous ne pouvez modifier que vos propres rapports.' }, 403);
        }

        // Validate PPN if provided
        if (ppn_id) {
            const ppn = await Ppn.findOne({ where: { id_ppn: ppn_id } });
            if (!ppn) {
                return Helper.send_res(res, { erreur: 'PPN non trouvé.' }, 404);
            }
        }

        // Validate numeric fields if provided
        const prices = [prix_unitaire_min, prix_unitaire_max, prix_gros_min, prix_gros_max].filter(p => p !== undefined);
        if (prices.some(p => isNaN(p) || p < 0)) {
            return Helper.send_res(res, { erreur: 'Les prix doivent être des nombres positifs.' }, 400);
        }

        // Validate date if provided
        let rapportDate = rapport.date;
        if (date) {
            rapportDate = new Date(date);
            if (isNaN(rapportDate.getTime())) {
                return Helper.send_res(res, { erreur: 'Date invalide.' }, 400);
            }
        }

        await Rapport.update(
            {
                ppn_id: ppn_id || rapport.ppn_id,
                prix_unitaire_min: prix_unitaire_min !== undefined ? prix_unitaire_min : rapport.prix_unitaire_min,
                prix_unitaire_max: prix_unitaire_max !== undefined ? prix_unitaire_max : rapport.prix_unitaire_max,
                prix_gros_min: prix_gros_min !== undefined ? prix_gros_min : rapport.prix_gros_min,
                prix_gros_max: prix_gros_max !== undefined ? prix_gros_max : rapport.prix_gros_max,
                district: district || rapport.district,
                observation: observation !== undefined ? observation : rapport.observation,
                date: rapportDate,
                created_at: rapport.created_at // Preserve original created_at
            },
            { where: { id_rapport } }
        );

        const updatedRapport = await Rapport.findOne({
            where: { id_rapport },
            include: [
                { model: Ppn, as: 'ppn' },
                { model: Employe, as: 'employe' }
            ]
        });

        return Helper.send_res(res, formatRapport(updatedRapport));
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: 'Impossible de modifier le rapport.' }, 500);
    }
};

// 7 - Delete Report
const deleteRapport = async (req, res) => {
    try {
        const id_rapport = req.params.id_rapport;
        const rapport = await Rapport.findOne({ where: { id_rapport } });
        if (!rapport) {
            return Helper.send_res(res, { erreur: 'Rapport non trouvé.' }, 404);
        }
        if (rapport.employe_id !== req.employe.id_employe) {
            return Helper.send_res(res, { erreur: 'Vous ne pouvez supprimer que vos propres rapports.' }, 403);
        }

        await Rapport.destroy({ where: { id_rapport } });
        return Helper.send_res(res, { message: 'Rapport supprimé avec succès.' });
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: 'Impossible de supprimer le rapport.' }, 500);
    }
};

// 8 - Admin Dashboard
const getDashboard = async (req, res) => {
    try {
        if (req.employe.fonction !== 'ADMINISTRATEUR') {
            return Helper.send_res(res, { erreur: 'Accès réservé aux administrateurs.' }, 403);
        }

        // Extract query parameters for filtering
        const { start_date, end_date, ppn_id, district } = req.query;

        // Build where clause for filtering
        const whereClause = {};
        if (start_date && end_date) {
            const start = moment(start_date).startOf('day').toDate();
            const end = moment(end_date).endOf('day').toDate();
            if (!moment(start_date).isValid() || !moment(end_date).isValid()) {
                return Helper.send_res(res, { erreur: 'Dates invalides.' }, 400);
            }
            whereClause.date = { [Op.between]: [start, end] };
        }
        if (ppn_id) {
            whereClause.ppn_id = ppn_id;
        }
        if (district) {
            whereClause.district = { [Op.like]: `%${district}%` };
        }

        const rapports = await Rapport.findAll({
            where: whereClause,
            include: [
                { model: Ppn, as: 'ppn' },
                { model: Employe, as: 'employe' }
            ]
        });

        if (!rapports.length) {
            return Helper.send_res(res, { message: 'Aucun rapport trouvé pour les filtres spécifiés.' }, 200);
        }

        // Parse prices and prepare data
        const parsedRapports = rapports.map(r => ({
            ...r.dataValues,
            avg_prix_unitaire: (parseFloat(r.prix_unitaire_min) + parseFloat(r.prix_unitaire_max)) / 2,
            avg_prix_gros: (parseFloat(r.prix_gros_min) + parseFloat(r.prix_gros_max)) / 2,
            month: moment(r.date).format('YYYY-MM'),
            year: moment(r.date).format('YYYY'),
            day: moment(r.date).format('YYYY-MM-DD'),
            region: r.employe?.region
        }));

        // Group data by various dimensions
        const byMonth = {};
        const byYear = {};
        const byPpn = {};
        const byEmploye = {};
        const byDistrict = {};
        const byRegion = {};
        const priceChanges = {};

        parsedRapports.forEach(r => {
            const ppnKey = r.ppn?.nom_ppn || 'Unknown';
            const empKey = r.employe?.nom || 'Unknown';
            const regionKey = r.region || 'Unknown';

            // By Month
            if (!byMonth[r.month]) byMonth[r.month] = { total_prix_unitaire: 0, total_prix_gros: 0, count: 0, prices_unitaire: [] };
            byMonth[r.month].total_prix_unitaire += r.avg_prix_unitaire;
            byMonth[r.month].total_prix_gros += r.avg_prix_gros;
            byMonth[r.month].count += 1;
            byMonth[r.month].prices_unitaire.push(r.avg_prix_unitaire);

            // By Year
            if (!byYear[r.year]) byYear[r.year] = { total_prix_unitaire: 0, total_prix_gros: 0, count: 0 };
            byYear[r.year].total_prix_unitaire += r.avg_prix_unitaire;
            byYear[r.year].total_prix_gros += r.avg_prix_gros;
            byYear[r.year].count += 1;

            // By PPN
            if (!byPpn[ppnKey]) byPpn[ppnKey] = { 
                total_prix_unitaire: 0, 
                total_prix_gros: 0, 
                count: 0, 
                prices_unitaire: [], 
                prices_gros: [],
                dates: []
            };
            byPpn[ppnKey].total_prix_unitaire += r.avg_prix_unitaire;
            byPpn[ppnKey].total_prix_gros += r.avg_prix_gros;
            byPpn[ppnKey].count += 1;
            byPpn[ppnKey].prices_unitaire.push(r.avg_prix_unitaire);
            byPpn[ppnKey].prices_gros.push(r.avg_prix_gros);
            byPpn[ppnKey].dates.push(r.day);

            // By Employe
            if (!byEmploye[empKey]) byEmploye[empKey] = { total_prix_unitaire: 0, total_prix_gros: 0, count: 0 };
            byEmploye[empKey].total_prix_unitaire += r.avg_prix_unitaire;
            byEmploye[empKey].total_prix_gros += r.avg_prix_gros;
            byEmploye[empKey].count += 1;

            // By District
            if (!byDistrict[r.district]) byDistrict[r.district] = { total_prix_unitaire: 0, total_prix_gros: 0, count: 0, prices_unitaire: [] };
            byDistrict[r.district].total_prix_unitaire += r.avg_prix_unitaire;
            byDistrict[r.district].total_prix_gros += r.avg_prix_gros;
            byDistrict[r.district].count += 1;
            byDistrict[r.district].prices_unitaire.push(r.avg_prix_unitaire);

            // By Region
            if (!byRegion[regionKey]) byRegion[regionKey] = { total_prix_unitaire: 0, total_prix_gros: 0, count: 0, prices_unitaire: [] };
            byRegion[regionKey].total_prix_unitaire += r.avg_prix_unitaire;
            byRegion[regionKey].total_prix_gros += r.avg_prix_gros;
            byRegion[regionKey].count += 1;
            byRegion[regionKey].prices_unitaire.push(r.avg_prix_unitaire);

            // Track price changes for frequency
            if (!priceChanges[ppnKey]) priceChanges[ppnKey] = [];
            priceChanges[ppnKey].push({ date: r.day, price: r.avg_prix_unitaire });
        });

        // Calculate Statistics
        const stats = {
            total_rapports: parsedRapports.length,
            avg_prix_unitaire: parsedRapports.length
                ? (parsedRapports.reduce((sum, r) => sum + r.avg_prix_unitaire, 0) / parsedRapports.length).toFixed(2)
                : "0.00",
            avg_prix_gros: parsedRapports.length
                ? (parsedRapports.reduce((sum, r) => sum + r.avg_prix_gros, 0) / parsedRapports.length).toFixed(2)
                : "0.00",
            max_prix_unitaire: Math.max(...parsedRapports.map(r => r.avg_prix_unitaire), 0).toFixed(2),
            min_prix_unitaire: Math.min(...parsedRapports.filter(r => r.avg_prix_unitaire > 0).map(r => r.avg_prix_unitaire), Infinity).toFixed(2) || "0.00",
            max_prix_gros: Math.max(...parsedRapports.map(r => r.avg_prix_gros), 0).toFixed(2),
            min_prix_gros: Math.min(...parsedRapports.filter(r => r.avg_prix_gros > 0).map(r => r.avg_prix_gros), Infinity).toFixed(2) || "0.00",
            by_month: Object.keys(byMonth).map(month => ({
                month,
                avg_prix_unitaire: (byMonth[month].total_prix_unitaire / byMonth[month].count).toFixed(2),
                avg_prix_gros: (byMonth[month].total_prix_gros / byMonth[month].count).toFixed(2),
                count: byMonth[month].count,
                max_prix_unitaire: Math.max(...byMonth[month].prices_unitaire, 0).toFixed(2),
                min_prix_unitaire: Math.min(...byMonth[month].prices_unitaire.filter(p => p > 0), Infinity).toFixed(2) || "0.00"
            })).sort((a, b) => a.month.localeCompare(b.month)),
            by_year: Object.keys(byYear).map(year => ({
                year,
                avg_prix_unitaire: (byYear[year].total_prix_unitaire / byYear[year].count).toFixed(2),
                avg_prix_gros: (byYear[year].total_prix_gros / byYear[year].count).toFixed(2),
                count: byYear[year].count
            })).sort((a, b) => a.year.localeCompare(b.year)),
            by_ppn: Object.keys(byPpn).map(nom_ppn => {
                const prices = byPpn[nom_ppn].prices_unitaire;
                const sortedChanges = priceChanges[nom_ppn]?.sort((a, b) => a.date.localeCompare(b.date)) || [];
                let changeFrequency = 0;
                if (sortedChanges.length > 1) {
                    for (let i = 1; i < sortedChanges.length; i++) {
                        if (sortedChanges[i].price !== sortedChanges[i - 1].price) {
                            changeFrequency++;
                        }
                    }
                }
                return {
                    nom_ppn: nom_ppn,
                    avg_prix_unitaire: (byPpn[nom_ppn].total_prix_unitaire / byPpn[nom_ppn].count).toFixed(2),
                    avg_prix_gros: (byPpn[nom_ppn].total_prix_gros / byPpn[nom_ppn].count).toFixed(2),
                    max_prix_unitaire: Math.max(...prices, 0).toFixed(2),
                    min_prix_unitaire: Math.min(...prices.filter(p => p > 0), Infinity).toFixed(2) || "0.00",
                    max_prix_gros: Math.max(...byPpn[nom_ppn].prices_gros, 0).toFixed(2),
                    min_prix_gros: Math.min(...byPpn[nom_ppn].prices_gros.filter(p => p > 0), Infinity).toFixed(2) || "0.00",
                    count: byPpn[nom_ppn].count,
                    price_evolution: byPpn[nom_ppn].dates.map((date, i) => ({
                        date,
                        avg_prix_unitaire: byPpn[nom_ppn].prices_unitaire[i].toFixed(2),
                        avg_prix_gros: byPpn[nom_ppn].prices_gros[i].toFixed(2)
                    })).sort((a, b) => a.date.localeCompare(b.date)),
                    change_frequency: changeFrequency
                };
            }),
            by_employe: Object.keys(byEmploye).map(nom => ({
                nom,
                avg_prix_unitaire: (byEmploye[nom].total_prix_unitaire / byEmploye[nom].count).toFixed(2),
                avg_prix_gros: (byEmploye[nom].total_prix_gros / byEmploye[nom].count).toFixed(2),
                count: byEmploye[nom].count
            })),
            by_district: Object.keys(byDistrict | {}).map(district => ({
                district,
                avg_prix_unitaire: (byDistrict[district].total_prix_unitaire / byDistrict[district].count).toFixed(2),
                avg_prix_gros: (byDistrict[district].total_prix_gros / byDistrict[district].count).toFixed(2),
                count: byDistrict[district].count,
                max_prix_unitaire: Math.max(...byDistrict[district].prices_unitaire, 0).toFixed(2),
                min_prix_unitaire: Math.min(...byDistrict[district].prices_unitaire.filter(p => p > 0), Infinity).toFixed(2) || "0.00"
            })),
            by_region: Object.keys(byRegion).map(region => ({
                region,
                avg_prix_unitaire: (byRegion[region].total_prix_unitaire / byRegion[region].count).toFixed(2),
                avg_prix_gros: (byRegion[region].total_prix_gros / byRegion[region].count).toFixed(2),
                count: byRegion[region].count,
                max_prix_unitaire: Math.max(...byRegion[region].prices_unitaire, 0).toFixed(2),
                min_prix_unitaire: Math.min(...byRegion[region].prices_unitaire.filter(p => p > 0), Infinity).toFixed(2) || "0.00"
            }))
        };

        // Inflation and IPC for prix_unitaire
        const monthlyPrices = stats.by_month;
        stats.inflation = [];
        for (let i = 1; i < monthlyPrices.length; i++) {
            const prev = parseFloat(monthlyPrices[i - 1].avg_prix_unitaire);
            const curr = parseFloat(monthlyPrices[i].avg_prix_unitaire);
            const inflationRate = prev > 0 ? ((curr - prev) / prev * 100).toFixed(2) : "0.00";
            stats.inflation.push({
                month: monthlyPrices[i].month,
                inflation_rate: inflationRate
            });
        }

        // IPC: Baseline is first month
        const basePrice = monthlyPrices[0] ? parseFloat(monthlyPrices[0].avg_prix_unitaire) : 1;
        stats.ipc = monthlyPrices.map(m => ({
            month: m.month,
            ipc: basePrice > 0 ? ((parseFloat(m.avg_prix_unitaire) / basePrice) * 100).toFixed(2) : "100.00"
        }));

        // Most Expensive Month (highest avg_prix_unitaire)
        const maxMonth = monthlyPrices.reduce((max, m) => parseFloat(m.avg_prix_unitaire) > parseFloat(max.avg_prix_unitaire) ? m : max, monthlyPrices[0] || {});
        stats.most_expensive_month = maxMonth.month || null;

        // Overall Price Evolution
        stats.price_evolution = monthlyPrices.map(m => ({
            month: m.month,
            avg_prix_unitaire: m.avg_prix_unitaire,
            avg_prix_gros: m.avg_prix_gros
        }));

        return Helper.send_res(res, stats);
    } catch (err) {
        console.error(err);
        return Helper.send_res(res, { erreur: 'Impossible de récupérer le tableau de bord.' }, 500);
    }
};

// 9 - Moderator Dashboard (regional)
const getModeratorDashboard = async (req, res) => {
  try {
    // Access: MODERATEUR only
    if (!req.employe || req.employe.fonction !== 'MODERATEUR') {
      return Helper.send_res(res, { erreur: 'Accès réservé aux modérateurs.' }, 403);
    }

    // Moderator profile => region comes from Moderateur table
    const moderateur = await db.Moderateur.findOne({
      where: { employe_id: req.employe.id_employe },
    });

    if (!moderateur) {
      return Helper.send_res(res, { erreur: 'Profil modérateur introuvable.' }, 404);
    }

    const region = moderateur.region;

    const ppns = await Ppn.findAll({ order: [['nom_ppn', 'ASC']] });

    const regionsRows = await db.Moderateur.findAll({
      attributes: ['region'],
      group: ['region'],
    });
    const nombreRegions = regionsRows.length;

    // 3) Rapports ce mois (dans la région du modérateur)
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    const rapportsThisMonth = await Rapport.count({
      where: { date: { [Op.between]: [startOfMonth, endOfMonth] } },
      include: [
        { model: Employe, as: 'employe', where: { region }, required: true },
      ],
    });

    // 4) Total rapports (dans la région du modérateur)
    const totalRapports = await Rapport.count({
      include: [
        { model: Employe, as: 'employe', where: { region }, required: true },
      ],
    });

    // (Optionnel) Derniers rapports de prix dans la région (avec tous champs prix)
    const latest = await Rapport.findAll({
      include: [
        { model: Ppn, as: 'ppn' },
        { model: Employe, as: 'employe', where: { region }, required: true },
      ],
      order: [['date', 'DESC']],
      limit: 10,
    });

    return Helper.send_res(res, {
      region,
      stats: {
        produitsPpn: ppns.length,
        rapportsThisMonth,
        totalRapports,
        nombreRegions,
      },
      ppns: ppns.map((p) => ({
        id_ppn: p.id_ppn,
        nom_ppn: p.nom_ppn,
        description: p.description,
        unite_mesure_unitaire: p.unite_mesure_unitaire,
        unite_mesure_gros: p.unite_mesure_gros,
        observation: p.observation,
        employe_id: p.employe_id,
      })),
      latestRapports: latest.map(formatRapport),
    });
  } catch (err) {
    console.error(err);
    return Helper.send_res(res, { erreur: 'Impossible de récupérer le dashboard modérateur.' }, 500);
  }
};


module.exports = {
    getAllRapports,
    getMyRapports,
    getOneRapport,
    searchRapports,
    addRapport,
    updateRapport,
    deleteRapport,
    getDashboard,
    getUsersWithRapports,
    getModeratorDashboard
};