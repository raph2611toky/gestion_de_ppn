const { faker } = require('@faker-js/faker');
const moment = require('moment');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const moderators = await queryInterface.sequelize.query(
      `SELECT id_employe, region FROM Employes WHERE fonction = 'MODERATEUR'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const ppns = await queryInterface.sequelize.query(
      `SELECT id_ppn FROM Ppns`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!moderators.length || !ppns.length) {
      throw new Error('Moderators or PPNs not found');
    }

    const districtsByRegion = {
      'DIANA': ['Ambilobe', 'Nosy Be'],
      'SAVA': ['Sambava', 'Antalaha'],
      'ITASY': ['Miarinarivo', 'Arivonimamo'],
      'ANALAMANGA': ['Antananarivo', 'Ambohidratrimo'],
      'VAKINANKARATRA': ['Antsirabe', 'Betafo'],
      'BONGOLAVA': ['Tsiroanomandidy', 'Fenoarivobe'],
      'SOFIA': ['Mandritsara', 'Antsohihy'],
      'BOENY': ['Mahajanga', 'Ambato Boeny'],
      'BETSIBOKA': ['Maevatanana', 'Tsaratanana'],
      'MELAKY': ['Maintirano', 'Antsalova'],
      'ALAOTRA_MANGORO': ['Ambatondrazaka', 'Moramanga'],
      'ATSINANANA': ['Toamasina', 'Vatomandry'],
      'ANALANJIROFO': ['Maroantsetra', 'Mananara Nord'],
      'AMORON_I_MANIA': ['Ambositra', 'Fandriana'],
      'HAUTE_MATSIATRA': ['Fianarantsoa', 'Ambalavao'],
      'VATOVAVY_FITOVINANY': ['Manakara', 'Vohipeno'],
      'ATSIMO_ATSINANANA': ['Farafangana', 'Vangaindrano'],
      'IHOROMBE': ['Ihosy', 'Ivohibe'],
      'MENABE': ['Morondava', 'Manja'],
      'ATSIMO_ANDREFANA': ['Toliara', 'Sakaraha'],
      'ANDROY': ['Ambovombe', 'Tsihombe'],
      'ANOSY': ['Taolanaro', 'Amboasary']
    };

    const rapports = [];
    const reportDates = [
      moment().subtract(30, 'days').toDate(),
      moment().subtract(20, 'days').toDate(),
      moment().subtract(10, 'days').toDate(),
      moment().toDate()
    ];

    for (const moderator of moderators) {
      const regionDistricts = districtsByRegion[moderator.region] || ['Unknown'];
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

    const existingRapports = await queryInterface.sequelize.query(
      `SELECT employe_id, ppn_id, date FROM Rapports`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingKeys = existingRapports.map(r => `${r.employe_id}-${r.ppn_id}-${moment(r.date).format('YYYY-MM-DD')}`);
    const newRapports = rapports.filter(r =>
      !existingKeys.includes(`${r.employe_id}-${r.ppn_id}-${moment(r.date).format('YYYY-MM-DD')}`)
    );

    if (newRapports.length > 0) {
      await queryInterface.bulkInsert('Rapports', newRapports);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rapports', null, {});
  }
};