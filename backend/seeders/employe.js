// seeders/employe.js — version ultra-minimale (seulement admins)
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admins = [
      {
        cin: '123456789001',
        nom: 'Admin 1',
        email: 'admin1@example.com',
        password: hashedPassword,
        fonction: 'ADMINISTRATEUR',
        is_active: true,
        photo: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        cin: '123456789002',
        nom: 'Admin 2',
        email: 'admin2@example.com',
        password: hashedPassword,
        fonction: 'ADMINISTRATEUR',
        is_active: true,
        photo: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('employes', admins, {
      ignoreDuplicates: true   
    });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('employes', {
      email: { [Sequelize.Op.in]: ['admin1@example.com', 'admin2@example.com'] }
    }, {});
  }
};