module.exports = (sequelize, DataTypes) => {
    const Employe = sequelize.define("Employe", {
        id_employe: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cin: {
            type: DataTypes.STRING,
            autoIncrement: false,
        },
        nom: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        region: {
            type: DataTypes.ENUM([
                'DIANA',
                'SAVA',
                'ITASY',
                'ANALAMANGA',
                'VAKINANKARATRA',
                'BONGOLAVA',
                'SOFIA',
                'BOENY',
                'BETSIBOKA',
                'MELAKY',
                'ALAOTRA_MANGORO',
                'ATSINANANA',
                'ANALANJIROFO',
                'AMORON_I_MANIA',
                'HAUTE_MATSIATRA',
                'VATOVAVY_FITOVINANY',
                'ATSIMO_ATSINANANA',
                'IHOROMBE',
                'MENABE',
                'ATSIMO_ANDREFANA',
                'ANDROY',
                'ANOSY'
            ]),
            allowNull: false,
        },
        fonction: {
            type: DataTypes.ENUM(['MODERATEUR', 'ADMINISTRATEUR']),
            allowNull: false,
        },
    });

    Employe.associate = (models) => {
        Employe.hasMany(models.Rapport, { foreignKey: 'employe_id', as: 'rapports' });
    };

    return Employe;
};