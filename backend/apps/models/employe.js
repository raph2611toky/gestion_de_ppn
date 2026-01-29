module.exports = (sequelize, DataTypes) => {
    const Employe = sequelize.define("Employe", {
        id_employe: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cin: {
            type: DataTypes.STRING(12),
            unique: true,
            allowNull: false,
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
        photo: {           
            type: DataTypes.STRING,  
            allowNull: true,
        },
        is_active: {           
            type: DataTypes.BOOLEAN,
            defaultValue: false,   
        },
        fonction: {
            type: DataTypes.ENUM(['MODERATEUR', 'ADMINISTRATEUR']),
            allowNull: false,
        },
    }, {
        tableName: 'employes',
        timestamps: true,
        paranoid: true,          
    });

    Employe.associate = (models) => {
        Employe.hasMany(models.Rapport, { foreignKey: 'employe_id', as: 'rapports' });
        Employe.hasOne(models.Moderateur, { foreignKey: 'employe_id', as: 'moderateurDetails' });
        Employe.hasMany(models.OtpCode,   { foreignKey: 'employe_id', as: 'otps' });
    };

    return Employe;
};