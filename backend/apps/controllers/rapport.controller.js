const { Op, where } = require("sequelize");
const db = require("../models");
const Helper = require('../../config/helper');
const moment = require('moment');

// Main models
const Rapport = db.Rapport;
const Ppn = db.Ppn;
const Employe = db.Employe;
const Moderateur = db.Moderateur;

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
        region: rapport.employe?.moderateurDetails?.region,
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
const getStats = async (req, res) => {
  try {
    if (!req.employe || req.employe.fonction !== 'ADMINISTRATEUR') {
      return Helper.send_res(res, { erreur: 'Accès réservé aux administrateurs.' }, 403);
    }

    const {
      ppn_id,
      region,
      year,
      month,
      start_date,
      end_date,
      district
    } = req.query;

    const whereClause = {};

    if (start_date && end_date) {
      if (!moment(start_date).isValid() || !moment(end_date).isValid()) {
        return Helper.send_res(res, { erreur: 'Dates invalides.' }, 400);
      }
      const start = moment(start_date).startOf('day').toDate();
      const end = moment(end_date).endOf('day').toDate();
      whereClause.date = { [Op.between]: [start, end] };
    }

    if (month && month !== 'Tous les mois') {
      if (!moment(month, 'YYYY-MM', true).isValid()) {
        return Helper.send_res(res, { erreur: 'Mois invalide (format attendu YYYY-MM).' }, 400);
      }
      const start = moment(month, 'YYYY-MM').startOf('month').toDate();
      const end = moment(month, 'YYYY-MM').endOf('month').toDate();
      whereClause.date = { [Op.between]: [start, end] };
    } else if (year && year !== 'Toutes les années') {
      if (!moment(year, 'YYYY', true).isValid()) {
        return Helper.send_res(res, { erreur: 'Année invalide (format attendu YYYY).' }, 400);
      }
      const start = moment(year, 'YYYY').startOf('year').toDate();
      const end = moment(year, 'YYYY').endOf('year').toDate();
      whereClause.date = { [Op.between]: [start, end] };
    }

    if (ppn_id && ppn_id !== 'all') {
      whereClause.ppn_id = ppn_id;
    }

    if (district) {
      whereClause.district = { [Op.like]: `%${district}%` };
    }

    const includeEmploye = {
      model: Employe,
      as: 'employe',
      required: true,
      include: [{ model: db.Moderateur, as: 'moderateurDetails', required: false }]
    };

    if (region && region !== 'Toutes les régions') {
      includeEmploye.include = [
        { model: db.Moderateur, as: 'moderateurDetails', required: true, where: { region } }
      ];
    }

    const rapports = await Rapport.findAll({
      where: whereClause,
      include: [
        { model: Ppn, as: 'ppn' },
        includeEmploye
      ],
      order: [['date', 'ASC']]
    });

    if (!rapports.length) {
      return Helper.send_res(res, { message: 'Aucun rapport trouvé pour les filtres spécifiés.' }, 200);
    }

    const safeNum = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    const computeStatsFromReports = (reports) => {
      const parsed = reports.map((r) => {
        const prixUnMin = safeNum(r.prix_unitaire_min);
        const prixUnMax = safeNum(r.prix_unitaire_max);
        const prixGrMin = safeNum(r.prix_gros_min);
        const prixGrMax = safeNum(r.prix_gros_max);

        const avgPrixUnitaire = (prixUnMin + prixUnMax) / 2;
        const avgPrixGros = (prixGrMin + prixGrMax) / 2;

        const d = moment(r.date);
        const m = d.format('YYYY-MM');
        const y = d.format('YYYY');
        const day = d.format('YYYY-MM-DD');

        const reg = r.employe?.moderateurDetails?.region || 'Unknown';
        const ppnName = r.ppn?.nom_ppn || 'Unknown';
        const empName = r.employe?.nom || 'Unknown';

        return { rapport: r, avgPrixUnitaire, avgPrixGros, month: m, year: y, day, region: reg, ppnName, empName };
      });

      const total = parsed.length;

      const sumUn = parsed.reduce((s, x) => s + x.avgPrixUnitaire, 0);
      const sumGr = parsed.reduce((s, x) => s + x.avgPrixGros, 0);

      const maxUn = Math.max(...parsed.map((x) => x.avgPrixUnitaire), 0);
      const maxGr = Math.max(...parsed.map((x) => x.avgPrixGros), 0);

      const minUnArr = parsed.map((x) => x.avgPrixUnitaire).filter((v) => v > 0);
      const minGrArr = parsed.map((x) => x.avgPrixGros).filter((v) => v > 0);

      const minUn = minUnArr.length ? Math.min(...minUnArr) : 0;
      const minGr = minGrArr.length ? Math.min(...minGrArr) : 0;

      const byMonthMap = {};
      const byYearMap = {};
      const byDateMap = {};
      const byDistrictMap = {};
      const byEmployeMap = {};

      parsed.forEach((x) => {
        const m = x.month;
        const y = x.year;
        const d = x.day;
        const dist = x.rapport.district || 'Unknown';
        const emp = x.empName;

        if (!byMonthMap[m]) byMonthMap[m] = { totalUn: 0, totalGr: 0, count: 0, un: [], gr: [] };
        byMonthMap[m].totalUn += x.avgPrixUnitaire;
        byMonthMap[m].totalGr += x.avgPrixGros;
        byMonthMap[m].count += 1;
        byMonthMap[m].un.push(x.avgPrixUnitaire);
        byMonthMap[m].gr.push(x.avgPrixGros);

        if (!byYearMap[y]) byYearMap[y] = { totalUn: 0, totalGr: 0, count: 0 };
        byYearMap[y].totalUn += x.avgPrixUnitaire;
        byYearMap[y].totalGr += x.avgPrixGros;
        byYearMap[y].count += 1;

        if (!byDateMap[d]) byDateMap[d] = { totalUn: 0, totalGr: 0, count: 0, rapports: [] };
        byDateMap[d].totalUn += x.avgPrixUnitaire;
        byDateMap[d].totalGr += x.avgPrixGros;
        byDateMap[d].count += 1;
        byDateMap[d].rapports.push(formatRapport(x.rapport));

        if (!byDistrictMap[dist]) byDistrictMap[dist] = { totalUn: 0, totalGr: 0, count: 0, un: [], gr: [] };
        byDistrictMap[dist].totalUn += x.avgPrixUnitaire;
        byDistrictMap[dist].totalGr += x.avgPrixGros;
        byDistrictMap[dist].count += 1;
        byDistrictMap[dist].un.push(x.avgPrixUnitaire);
        byDistrictMap[dist].gr.push(x.avgPrixGros);

        if (!byEmployeMap[emp]) byEmployeMap[emp] = { totalUn: 0, totalGr: 0, count: 0 };
        byEmployeMap[emp].totalUn += x.avgPrixUnitaire;
        byEmployeMap[emp].totalGr += x.avgPrixGros;
        byEmployeMap[emp].count += 1;
      });

      const by_month = Object.keys(byMonthMap)
        .map((month) => {
          const it = byMonthMap[month];
          const avgU = it.count ? it.totalUn / it.count : 0;
          const avgG = it.count ? it.totalGr / it.count : 0;
          const maxU = Math.max(...it.un, 0);
          const minUArr = it.un.filter((p) => p > 0);
          const minU = minUArr.length ? Math.min(...minUArr) : 0;
          const maxG = Math.max(...it.gr, 0);
          const minGArr = it.gr.filter((p) => p > 0);
          const minG = minGArr.length ? Math.min(...minGArr) : 0;
          return {
            month,
            avg_prix_unitaire: avgU.toFixed(2),
            avg_prix_gros: avgG.toFixed(2),
            count: it.count,
            max_prix_unitaire: maxU.toFixed(2),
            min_prix_unitaire: minU.toFixed(2),
            max_prix_gros: maxG.toFixed(2),
            min_prix_gros: minG.toFixed(2)
          };
        })
        .sort((a, b) => a.month.localeCompare(b.month));

      const by_year = Object.keys(byYearMap)
        .map((year) => {
          const it = byYearMap[year];
          const avgU = it.count ? it.totalUn / it.count : 0;
          const avgG = it.count ? it.totalGr / it.count : 0;
          return { year, avg_prix_unitaire: avgU.toFixed(2), avg_prix_gros: avgG.toFixed(2), count: it.count };
        })
        .sort((a, b) => a.year.localeCompare(b.year));

      const by_date = Object.keys(byDateMap)
        .map((date) => {
          const it = byDateMap[date];
          const avgU = it.count ? it.totalUn / it.count : 0;
          const avgG = it.count ? it.totalGr / it.count : 0;
          return { date, avg_prix_unitaire: avgU.toFixed(2), avg_prix_gros: avgG.toFixed(2), count: it.count, rapports: it.rapports };
        })
        .sort((a, b) => a.date.localeCompare(b.date));

      const by_employe = Object.keys(byEmployeMap).map((nom) => {
        const it = byEmployeMap[nom];
        const avgU = it.count ? it.totalUn / it.count : 0;
        const avgG = it.count ? it.totalGr / it.count : 0;
        return { nom, avg_prix_unitaire: avgU.toFixed(2), avg_prix_gros: avgG.toFixed(2), count: it.count };
      });

      const by_district = Object.keys(byDistrictMap).map((district) => {
        const it = byDistrictMap[district];
        const avgU = it.count ? it.totalUn / it.count : 0;
        const avgG = it.count ? it.totalGr / it.count : 0;
        const maxU = Math.max(...it.un, 0);
        const minUArr = it.un.filter((p) => p > 0);
        const minU = minUArr.length ? Math.min(...minUArr) : 0;
        const maxG = Math.max(...it.gr, 0);
        const minGArr = it.gr.filter((p) => p > 0);
        const minG = minGArr.length ? Math.min(...minGArr) : 0;
        return {
          district,
          avg_prix_unitaire: avgU.toFixed(2),
          avg_prix_gros: avgG.toFixed(2),
          count: it.count,
          max_prix_unitaire: maxU.toFixed(2),
          min_prix_unitaire: minU.toFixed(2),
          max_prix_gros: maxG.toFixed(2),
          min_prix_gros: minG.toFixed(2)
        };
      });

      const inflation = [];
      for (let i = 1; i < by_month.length; i++) {
        const prev = parseFloat(by_month[i - 1].avg_prix_unitaire);
        const curr = parseFloat(by_month[i].avg_prix_unitaire);
        const rate = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
        inflation.push({ month: by_month[i].month, inflationrate: rate.toFixed(2) });
      }

      const base = by_month[0] ? parseFloat(by_month[0].avg_prix_unitaire) : 1;
      const ipc = by_month.map((m) => ({
        month: m.month,
        ipc: base > 0 ? ((parseFloat(m.avg_prix_unitaire) / base) * 100).toFixed(2) : '100.00'
      }));

      const most_expensive_month = by_month.length
        ? by_month.reduce((max, m) => (parseFloat(m.avg_prix_unitaire) > parseFloat(max.avg_prix_unitaire) ? m : max), by_month[0]).month
        : null;

      const price_evolution = by_month.map((m) => ({
        month: m.month,
        avg_prix_unitaire: m.avg_prix_unitaire,
        avg_prix_gros: m.avg_prix_gros
      }));

      return {
        total_rapports: total,
        avg_prix_unitaire: total ? (sumUn / total).toFixed(2) : '0.00',
        avg_prix_gros: total ? (sumGr / total).toFixed(2) : '0.00',
        max_prix_unitaire: maxUn.toFixed(2),
        min_prix_unitaire: minUn.toFixed(2),
        max_prix_gros: maxGr.toFixed(2),
        min_prix_gros: minGr.toFixed(2),
        by_month,
        by_year,
        by_date,
        by_employe,
        by_district: by_district,
        inflation,
        ipc,
        most_expensive_month: most_expensive_month,
        price_evolution
      };
    };

    const group = {};
    rapports.forEach((r) => {
      const reg = r.employe?.moderateurDetails?.region || 'Unknown';
      const empId = r.employe?.idemploye || 'Unknown';
      const empName = r.employe?.nom || 'Unknown';
      const empEmail = r.employe?.email || null;
      const empCin = r.employe?.cin || null;

      const ppnId = r.ppn?.id_ppn || 'Unknown';
      const ppnName = r.ppn?.nom_ppn || 'Unknown';

      if (!group[reg]) group[reg] = { region: reg, employes: {} };

      if (!group[reg].employes[empId]) {
        group[reg].employes[empId] = {
          id_employe: empId,
          nom: empName,
          email: empEmail,
          cin: empCin,
          fonction: r.employe?.fonction || null,
          ppns: {}
        };
      }

      if (!group[reg].employes[empId].ppns[ppnId]) {
        group[reg].employes[empId].ppns[ppnId] = {
          id_ppn: ppnId,
          nom_ppn: ppnName,
          description: r.ppn?.description || null,
          unite_mesure_unitaire: r.ppn?.unite_mesure_unitaire || null,
          unite_mesure_gros: r.ppn?.unite_mesure_gros || null,
          observation: r.ppn?.observation || null,
          rapports: []
        };
      }

      group[reg].employes[empId].ppns[ppnId].rapports.push(r);
    });

    const regions = Object.keys(group)
      .sort((a, b) => a.localeCompare(b))
      .map((regKey) => {
        const regionNode = group[regKey];

        const employes = Object.keys(regionNode.employes)
          .map((empKey) => {
            const empNode = regionNode.employes[empKey];

            const ppns = Object.keys(empNode.ppns).map((ppnKey) => {
              const ppnNode = empNode.ppns[ppnKey];
              const stats = computeStatsFromReports(ppnNode.rapports);

              return {
                id_ppn: ppnNode.id_ppn,
                nom_ppn: ppnNode.nom_ppn,
                description: ppnNode.description,
                unite_mesure_unitaire: ppnNode.unite_mesure_unitaire,
                unite_mesure_gros: ppnNode.unite_mesure_gros,
                observation: ppnNode.observation,
                total_rapports: stats.total_rapports,
                avg_prix_unitaire: stats.avg_prix_unitaire,
                avg_prix_gros: stats.avg_prix_gros,
                max_prix_unitaire: stats.max_prix_unitaire,
                min_prix_unitaire: stats.min_prix_unitaire,
                max_prix_gros: stats.max_prix_gros,
                min_prix_gros: stats.min_prix_gros,
                by_year: stats.by_year,
                by_month: stats.by_month,
                by_date: stats.by_date,
                by_employe: stats.by_employe,
                by_district: stats.by_district,
                inflation: stats.inflation,
                ipc: stats.ipc,
                most_expensive_month: stats.most_expensive_month,
                price_evolution: stats.price_evolution,
                latest_rapports: ppnNode.rapports
                  .slice()
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map(formatRapport)
              };
            });

            const allEmpReports = Object.values(empNode.ppns).flatMap((p) => p.rapports);
            const empStats = computeStatsFromReports(allEmpReports);

            return {
              id_employe: empNode.id_employe,
              nom: empNode.nom,
              email: empNode.email,
              cin: empNode.cin,
              fonction: empNode.fonction,
              total_rapports: empStats.total_rapports,
              avg_prix_unitaire: empStats.avg_prix_unitaire,
              avg_prix_gros: empStats.avg_prix_gros,
              max_prix_unitaire: empStats.max_prix_unitaire,
              min_prix_unitaire: empStats.min_prix_unitaire,
              max_prix_gros: empStats.max_prix_gros,
              min_prix_gros: empStats.min_prix_gros,
              by_year: empStats.by_year,
              by_month: empStats.by_month,
              by_date: empStats.by_date,
              by_employe: empStats.by_employe,
              by_district: empStats.by_district,
              inflation: empStats.inflation,
              ipc: empStats.ipc,
              most_expensive_month: empStats.most_expensive_month,
              price_evolution: empStats.price_evolution,
              ppns
            };
          })
          .sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || '')));

        const regionReportsRaw = Object.values(regionNode.employes).flatMap((e) =>
          Object.values(e.ppns).flatMap((p) => p.rapports)
        );
        const regionStats = computeStatsFromReports(regionReportsRaw);

        return {
          region: regionNode.region,
          total_rapports: regionStats.total_rapports,
          avg_prix_unitaire: regionStats.avg_prix_unitaire,
          avg_prix_gros: regionStats.avg_prix_gros,
          max_prix_unitaire: regionStats.max_prix_unitaire,
          min_prix_unitaire: regionStats.min_prix_unitaire,
          max_prix_gros: regionStats.max_prix_gros,
          min_prix_gros: regionStats.min_prix_gros,
          by_year: regionStats.by_year,
          by_month: regionStats.by_month,
          by_date: regionStats.by_date,
          by_employe: regionStats.by_employe,
          by_district: regionStats.by_district,
          inflation: regionStats.inflation,
          ipc: regionStats.ipc,
          most_expensive_month: regionStats.most_expensive_month,
          price_evolution: regionStats.price_evolution,
          employes
        };
      });

    const globalStats = computeStatsFromReports(rapports);

    return Helper.send_res(res, {
      filters: {
        ppn_id: ppn_id || null,
        region: region || null,
        year: year || null,
        month: month || null,
        start_date: start_date || null,
        end_date: end_date || null,
        district: district || null
      },
      total_rapports: globalStats.total_rapports,
      avg_prix_unitaire: globalStats.avg_prix_unitaire,
      avg_prix_gros: globalStats.avg_prix_gros,
      max_prix_unitaire: globalStats.max_prix_unitaire,
      min_prix_unitaire: globalStats.min_prix_unitaire,
      max_prix_gros: globalStats.max_prix_gros,
      min_prix_gros: globalStats.min_prix_gros,
      by_month: globalStats.by_month,
      by_year: globalStats.by_year,
      by_date: globalStats.by_date,
      by_employe: globalStats.by_employe,
      by_district: globalStats.by_district,
      inflation: globalStats.inflation,
      ipc: globalStats.ipc,
      most_expensive_month: globalStats.most_expensive_month,
      price_evolution: globalStats.price_evolution,
      regions
    });
  } catch (err) {
    console.error(err);
    return Helper.send_res(res, { erreur: 'Impossible de récupérer le tableau de bord.' }, 500);
  }
};


// 9 - Moderator Dashboard (regional)
const getDashboard = async (req, res) => {
  try {
    if (!req.employe) {
      return Helper.send_res(res, { erreur: 'Non authentifié.' }, 401);
    }

    if (!['MODERATEUR', 'ADMINISTRATEUR'].includes(req.employe.fonction)) {
      return Helper.send_res(res, { erreur: 'Accès interdit.' }, 403);
    }

    const Moderateur = db.Moderateur;

    const ppns = await Ppn.findAll({ order: [['nom_ppn', 'ASC']] });

    const regionsRows = await Moderateur.findAll({
      attributes: ['region'],
      group: ['region'],
    });
    const nombreRegions = regionsRows.length;

    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    let region = null;
    let includeRegion = [];
    let comptesEnAttente;

    if (req.employe.fonction === 'MODERATEUR') {
      const moderateur = await Moderateur.findOne({
        where: { employe_id: req.employe.id_employe },
      });

      if (!moderateur) {
        return Helper.send_res(res, { erreur: 'Profil modérateur introuvable.' }, 404);
      }

      region = moderateur.region;

      includeRegion = [
        {
          model: Employe,
          as: 'employe',
          required: true,
          include: [
            {
              model: Moderateur,
              as: 'moderateurDetails',
              required: true,
              where: { region },
            },
          ],
        },
      ];
    } else {
      comptesEnAttente = await Moderateur.count({
        where: { is_validated: false },
      });
    }

    const rapportsThisMonth = await Rapport.count({
      where: { date: { [Op.between]: [startOfMonth, endOfMonth] } },
      include: includeRegion,
    });

    const totalRapports = await Rapport.count({
      include: includeRegion,
    });

    const latest = await Rapport.findAll({
      include: [
        { model: Ppn, as: 'ppn' },
        {
          model: Employe,
          as: 'employe',
          required: includeRegion.length > 0,
          include: includeRegion.length
            ? [
                {
                  model: Moderateur,
                  as: 'moderateurDetails',
                  required: true,
                  where: { region },
                },
              ]
            : [],
        },
      ],
      order: [['date', 'DESC']],
      limit: 10,
    });

    const payload = {
      region,
      stats: {
        produitsPpn: ppns.length,
        rapportsThisMonth,
        totalRapports,
        nombreRegions,
        ...(req.employe.fonction === 'ADMINISTRATEUR' ? { comptesEnAttente } : {}),
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
    };

    return Helper.send_res(res, payload);
  } catch (err) {
    console.error(err);
    return Helper.send_res(res, { erreur: 'Impossible de récupérer le dashboard.' }, 500);
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
    getStats,
    getUsersWithRapports,
    getDashboard
};