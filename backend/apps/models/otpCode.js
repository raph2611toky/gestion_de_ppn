module.exports = (sequelize, DataTypes) => {
    const OtpCode = sequelize.define("OtpCode", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        employe_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'employes', key: 'id_employe' },
            onDelete: 'CASCADE'
        },
        code: {
            type: DataTypes.STRING(6),
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        used: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        tableName: 'otp_codes',
        timestamps: true,
    });

    OtpCode.associate = (models) => {
        OtpCode.belongsTo(models.Employe, { foreignKey: 'employe_id', as: 'employe' });
    };

    return OtpCode;
};