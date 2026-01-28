const dbConfig = require("../../config/db_config.js").development;
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbConfig.storage,
  logging: dbConfig.logging
});

sequelize
  .authenticate()
  .then(() => {
    console.log("connected...");
  })
  .catch((err) => {
    console.log("Error " + err);
  });

const db = {};

db.Sequelize = sequelize;
db.sequelize = sequelize;

db.Employe = require("./employe.js")(sequelize, DataTypes);
db.Ppn = require("./ppn")(sequelize, DataTypes);
db.Rapport = require("./rapport")(sequelize, DataTypes);

Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done!");
});

module.exports = db;