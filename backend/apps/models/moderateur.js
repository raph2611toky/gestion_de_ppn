module.exports = (sequelize, DataTypes) => {
    const Moderateur = sequelize.define("Moderateur", {
        employe_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'employes',
                key: 'id_employe'
            },
            onDelete: 'CASCADE'
        },
        piece_identite_face: {
            type: DataTypes.STRING,    
            allowNull: true,
        },
        piece_identite_recto: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_verified: {            
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_validated: {         
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        region: {              
            type: DataTypes.ENUM([
                'DIANA','SAVA','ITASY','ANALAMANGA','VAKINANKARATRA','BONGOLAVA',
                'SOFIA','BOENY','BETSIBOKA','MELAKY','ALAOTRA_MANGORO','ATSINANANA',
                'ANALANJIROFO','AMORON_I_MANIA','HAUTE_MATSIATRA','VATOVAVY_FITOVINANY',
                'ATSIMO_ATSINANANA','IHOROMBE','MENABE','ATSIMO_ANDREFANA','ANDROY','ANOSY'
            ]),
            allowNull: false,
        },
    }, {
        tableName: 'moderateurs',
        timestamps: true,
    });

    Moderateur.associate = (models) => {
        Moderateur.belongsTo(models.Employe, { foreignKey: 'employe_id', as: 'employe' });
    };

    return Moderateur;
};