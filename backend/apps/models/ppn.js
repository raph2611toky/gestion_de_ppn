module.exports = (sequelize, DataTypes) => {
    const Ppn = sequelize.define("Ppn", {
        id_ppn: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        unite_mesure_unitaire: {
            type: DataTypes.STRING,
            allowNull: true
        },
        unite_mesure_gros: {
            type: DataTypes.STRING,
            allowNull: true
        },
        observation: {
            type: DataTypes.STRING,
            allowNull: true
        },
        nom_ppn: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        employe_id: {
            type:DataTypes.INTEGER,
            allowNull: false
        }
    });
    Ppn.associate = (models) => {
        Ppn.belongsTo(models.Employe, { foreignKey: 'employe_id', as: 'ppns_employe' });
    };

    return Ppn;
};
