module.exports = (sequelize, DataTypes) => {
    const Rapport = sequelize.define("Rapport", {
        id_rapport: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ppn_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        employe_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        prix_unitaire_min: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        prix_unitaire_max: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        prix_gros_min: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        prix_gros_max: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        district: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        observation: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
    });

    Rapport.associate = (models) => {
        Rapport.belongsTo(models.Ppn, { foreignKey: 'ppn_id', as: 'ppn' });
        Rapport.belongsTo(models.Employe, { foreignKey: 'employe_id', as: 'employe' });
    };

    return Rapport;
};