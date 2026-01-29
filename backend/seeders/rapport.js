// seeders/rapport.js
const { faker } = require('@faker-js/faker');
const moment = require('moment');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Récupérer les modérateurs + leur région via jointure
    const moderators = await queryInterface.sequelize.query(
      `
      SELECT 
        e.id_employe, 
        m.region
      FROM Employes e
      INNER JOIN moderateurs m ON e.id_employe = m.employe_id
      WHERE e.fonction = 'MODERATEUR'
      `,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Récupérer les PPNs
    const ppns = await queryInterface.sequelize.query(
      `SELECT id_ppn FROM Ppns`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!moderators.length) {
      console.warn('⚠️ Aucun modérateur trouvé → impossible de générer des rapports');
      return;
    }

    if (!ppns.length) {
      console.warn('⚠️ Aucun PPN trouvé → impossible de générer des rapports');
      return;
    }

    const districtsByRegion = {
      'DIANA': ['Ambilobe', 'Nosy Be', 'Antsiranana'],
      'SAVA': ['Sambava', 'Antalaha', 'Vohemar'],
      'ITASY': ['Miarinarivo', 'Arivonimamo', 'Soavinandriana'],
      'ANALAMANGA': ['Antananarivo', 'Ambohidratrimo', 'Anjozorobe'],
      'VAKINANKARATRA': ['Antsirabe', 'Betafo', 'Ambatolampy'],
      'BONGOLAVA': ['Tsiroanomandidy', 'Fenoarivobe', 'Faratsiho'],
      'SOFIA': ['Mandritsara', 'Antsohihy', 'Mampikony'],
      'BOENY': ['Mahajanga', 'Ambato Boeny', 'Marovoay'],
      'BETSIBOKA': ['Maevatanana', 'Tsaratanana', 'Kandreho'],
      'MELAKY': ['Maintirano', 'Antsalova', 'Besalampy'],
      'ALAOTRA_MANGORO': ['Ambatondrazaka', 'Moramanga', 'Amparafaravola'],
      'ATSINANANA': ['Toamasina', 'Vatomandry', 'Brickaville'],
      'ANALANJIROFO': ['Maroantsetra', 'Mananara Nord', 'Sainte Marie'],
      'AMORON_I_MANIA': ['Ambositra', 'Fandriana', 'Antsirabe II'],
      'HAUTE_MATSIATRA': ['Fianarantsoa', 'Ambalavao', 'Manakara'],
      'VATOVAVY_FITOVINANY': ['Manakara', 'Vohipeno', 'Ifanadiana'],
      'ATSIMO_ATSINANANA': ['Farafangana', 'Vangaindrano', 'Midongy Atsimo'],
      'IHOROMBE': ['Ihosy', 'Ivohibe', 'Ikalamavony'],
      'MENABE': ['Morondava', 'Manja', 'Belo sur Tsiribihina'],
      'ATSIMO_ANDREFANA': ['Toliara', 'Sakaraha', 'Betioky Sud'],
      'ANDROY': ['Ambovombe', 'Tsihombe', 'Bekitro'],
      'ANOSY': ['Taolanaro', 'Amboasary', 'Fort-Dauphin']
    };

    const rapports = [];
    const reportDates = [
      moment().subtract(30, 'days').toDate(),
      moment().subtract(20, 'days').toDate(),
      moment().subtract(10, 'days').toDate(),
      moment().toDate()
    ];

    for (const moderator of moderators) {
      const regionDistricts = districtsByRegion[moderator.region] || ['District inconnu'];

      for (let i = 0; i < 4; i++) {
        const ppn = ppns[Math.floor(Math.random() * ppns.length)];
        const district = regionDistricts[Math.floor(Math.random() * regionDistricts.length)];
        const basePrice = getRandomInt(1000, 5000);

        rapports.push({
          ppn_id: ppn.id_ppn,
          employe_id: moderator.id_employe,
          prix_unitaire_min: basePrice,
          prix_unitaire_max: basePrice + getRandomInt(100, 500),
          prix_gros_min: basePrice * 0.9,
          prix_gros_max: (basePrice + getRandomInt(100, 500)) * 0.9,
          district: district,
          observation: faker.lorem.sentence(),
          date: reportDates[i],
          created_at: new Date()
        });
      }
    }

    // Éviter les doublons (clé unique : employe_id + ppn_id + date)
    const existingRapports = await queryInterface.sequelize.query(
      `SELECT employe_id, ppn_id, date FROM Rapports`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingKeys = existingRapports.map(r => 
      `${r.employe_id}-${r.ppn_id}-${moment(r.date).format('YYYY-MM-DD')}`
    );

    const newRapports = rapports.filter(r => 
      !existingKeys.includes(`${r.employe_id}-${r.ppn_id}-${moment(r.date).format('YYYY-MM-DD')}`)
    );

    if (newRapports.length > 0) {
      await queryInterface.bulkInsert('Rapports', newRapports, {});
      console.log(`→ ${newRapports.length} rapports insérés`);
    } else {
      console.log('→ Aucun nouveau rapport à insérer (déjà existants)');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rapports', null, {});
  }
};