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

    // Create 2 Administrators
    for (let i = 1; i <= 2; i++) {
      employes.push({
        cin: `1234567890${i.toString().padStart(2, '0')}`,
        nom: `Admin ${i}`,
        email: `admin${i}@example.com`,
        password: hashedPassword,
        region: 'ANALAMANGA',
        fonction: 'ADMINISTRATEUR',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create 1 Moderator per region
    regions.forEach((region, index) => {
      employes.push({
        cin: `9876543210${(index + 1).toString().padStart(2, '0')}`,
        nom: faker.person.fullName(),
        email: `moderator${index + 1}@example.com`,
        password: hashedPassword,
        region: region,
        fonction: 'MODERATEUR',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Check for existing employees by email to avoid duplicates
    const existingEmployes = await queryInterface.sequelize.query(
      `SELECT email FROM Employes WHERE email IN (:emails)`,
      {
        replacements: { emails: employes.map(e => e.email) },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    const existingEmails = existingEmployes.map(e => e.email);
    const newEmployes = employes.filter(e => !existingEmails.includes(e.email));

    if (newEmployes.length > 0) {
      await queryInterface.bulkInsert('Employes', newEmployes);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Employes', {
      email: {
        [Sequelize.Op.like]: '%@example.com'
      }
    });
  }
};