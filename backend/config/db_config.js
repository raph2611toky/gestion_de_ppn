module.exports = {
    development: {
      username: 'raph',
      password: 'hpar',
      database: 'gestion_de_ppn',
      host: 'localhost',
      dialect: 'mariadb',
      pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 2000
      },
      logging: false
    }
  };