const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Find an Administrator to assign PPNs
    const admin = await queryInterface.sequelize.query(
      `SELECT id_employe FROM Employes WHERE fonction = 'ADMINISTRATEUR' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!admin.length) {
      throw new Error('No administrator found to assign PPNs');
    }

    const employe_id = admin[0].id_employe;
    const ppns = [];

    // Define 10 sample PPNs
    const samplePpns = [
      { nom: 'Riz', unite_mesure_unitaire: 'kg', unite_mesure_gros: 'sack', description: 'Riz blanc local' },
      { nom: 'Maïs', unite_mesure_unitaire: 'kg', unite_mesure_gros: 'sack', description: 'Maïs jaune' },
      { nom: 'Haricot', unite_mesure_unitaire: 'kg', unite_mesure_gros: 'sack', description: 'Haricot rouge' },
      { nom: 'Huile', unite_mesure_unitaire: 'litre', unite_mesure_gros: 'bidon', description: 'Huile de soja' },
      { nom: 'Sucre', unite_mesure_unitaire: 'kg', unite_mesure_gros: 'sack', description: 'Sucre blanc' },
      { nom: 'Farine', unite_mesure_unitaire: 'kg', unite_mesure_gros: 'sack', description: 'Farine de blé' },
      { nom: 'Sel', unite_mesure_unitaire: 'kg', unite_mesure_gros: 'sack', description: 'Sel iodé' },
      { nom: 'Pâtes', unite_mesure_unitaire: 'kg', unite_mesure_gros: 'carton', description: 'Spaghetti' },
      { nom: 'Savon', unite_mesure_unitaire: 'unité', unite_mesure_gros: 'carton', description: 'Savon de ménage' },
      { nom: 'Lait', unite_mesure_unitaire: 'litre', unite_mesure_gros: 'carton', description: 'Lait en poudre' }
    ];

    samplePpns.forEach(ppn => {
      ppns.push({
        nom_ppn: ppn.nom,
        unite_mesure_unitaire: ppn.unite_mesure_unitaire,
        unite_mesure_gros: ppn.unite_mesure_gros,
        description: ppn.description,
        observation: faker.lorem.sentence(),
        employe_id: employe_id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Check for existing PPNs by nom_ppn
    const existingPpns = await queryInterface.sequelize.query(
      `SELECT nom_ppn FROM Ppns WHERE nom_ppn IN (:names)`,
      {
        replacements: { names: ppns.map(p => p.nom_ppn) },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    const existingNames = existingPpns.map(p => p.nom_ppn);
    const newPpns = ppns.filter(p => !existingNames.includes(p.nom_ppn));

    if (newPpns.length > 0) {
      await queryInterface.bulkInsert('Ppns', newPpns);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Ppns', {
      nom_ppn: {
        [Sequelize.Op.like]: '%'
      }
    });
  }
};