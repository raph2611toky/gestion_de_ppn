const db = require('./apps/models');
const employeSeeder = require('./seeders/employe');
const ppnSeeder = require('./seeders/ppn');
const rapportSeeder = require('./seeders/rapport');

(async () => {
  try {
    console.log('🌱 Seeding database...');

    await db.sequelize.sync({ force: false });

    await employeSeeder.up(db.sequelize.getQueryInterface(), db.Sequelize);
    console.log('✅ Employes seeded');

    await ppnSeeder.up(db.sequelize.getQueryInterface(), db.Sequelize);
    console.log('✅ PPN seeded');

    await rapportSeeder.up(db.sequelize.getQueryInterface(), db.Sequelize);
    console.log('✅ Rapports seeded');

    console.log('🎉 Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
})();
