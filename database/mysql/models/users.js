module.exports = (sequelize, DataTypes) =>{
    const Users = sequelize.define('Users', {
            id:{
                type:DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement:true,
            },
            name:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            email:{
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            license_type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            license_no:{
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName:'users',
            timestamps: false
        }
    );
    Users.associate = (db) => {
        Users.hasMany(db.Children, {
            foreignKey:'userid',
            sourceKey: 'id',
        });
        Users.hasMany(db.Tests, {
            foreignKey:'userid',
            sourceKey:'id',
        });
    }
    return Users;
}
