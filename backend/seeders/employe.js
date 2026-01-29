const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const regions = [
      'DIANA', 'SAVA', 'ITASY', 'ANALAMANGA', 'VAKINANKARATRA', 'BONGOLAVA',
      'SOFIA', 'BOENY', 'BETSIBOKA', 'MELAKY', 'ALAOTRA_MANGORO', 'ATSINANANA',
      'ANALANJIROFO', 'AMORON_I_MANIA', 'HAUTE_MATSIATRA', 'VATOVAVY_FITOVINANY',
      'ATSIMO_ATSINANANA', 'IHOROMBE', 'MENABE', 'ATSIMO_ANDREFANA', 'ANDROY', 'ANOSY'
    ];

    const hashedPassword = await bcrypt.hash('password123', 10);
    const employes = [];

    for (let i = 1; i <= 2; i++) {
      employes.push({
        cin: `1234567890${i.toString().padStart(2, '0')}`,
        nom: `Admin ${i}`,
        email: `admin${i}@example.com`,
        password: hashedPassword,
        fonction: 'ADMINISTRATEUR',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create 1 Moderator per region (region dans Moderateur, is_active: true)
    regions.forEach((region, index) => {
      employes.push({
        cin: `9876543210${(index + 1).toString().padStart(2, '0')}`,
        nom: faker.person.fullName(),
        email: `moderator${index + 1}@example.com`,
        password: hashedPassword,
        fonction: 'MODERATEUR',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _temp_region: region
      });
    });

    for (const empData of employes) {
      const existing = await queryInterface.sequelize.query(
        `SELECT id_employe FROM employes WHERE email = :email`,
        {
          replacements: { email: empData.email },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      if (existing.length === 0) {
        const insertQuery = `
          INSERT INTO employes (cin, nom, email, password, fonction, is_active, createdAt, updatedAt)
          VALUES (:cin, :nom, :email, :password, :fonction, :is_active, :createdAt, :updatedAt)
          RETURNING id_employe
        `;
        const [result] = await queryInterface.sequelize.query(insertQuery, {
          replacements: {
            cin: empData.cin,
            nom: empData.nom,
            email: empData.email,
            password: empData.password,
            fonction: empData.fonction,
            is_active: empData.is_active,
            createdAt: empData.createdAt,
            updatedAt: empData.updatedAt
          }
        });
        const id_employe = result[0].id_employe;

        // Si MODERATEUR, créer entrée Moderateur
        if (empData.fonction === 'MODERATEUR') {
          await queryInterface.sequelize.query(`
            INSERT INTO moderateurs (employe_id, region, is_verified, is_validated, createdAt, updatedAt)
            VALUES (:employe_id, :region, :is_verified, :is_validated, :createdAt, :updatedAt)
          `, {
            replacements: {
              employe_id: id_employe,
              region: empData._temp_region,
              is_verified: true, // Pour seed
              is_validated: true, // Pour seed
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('employes', {
      email: {
        [Sequelize.Op.like]: '%@example.com'
      }
    });
  }
};