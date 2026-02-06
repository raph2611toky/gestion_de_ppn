const dbConfig = require("../../config/db_config.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("connected...");
  })
  .catch((err) => {
    console.log("Error " + err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Employe = require("./employe.js")(sequelize, DataTypes);
db.Ppn = require("./ppn")(sequelize, DataTypes);
db.Rapport = require("./rapport")(sequelize, DataTypes);
db.Moderateur = require("./moderateur")(sequelize, DataTypes);
db.OtpCode = require("./otpCode")(sequelize, DataTypes);

Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done!");
});

module.exports = db;