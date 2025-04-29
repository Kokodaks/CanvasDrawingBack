module.exports = (sequelize, DataTypes) =>{
    const User = sequelize.define('User', {
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
            regist_type: {
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
    return User;
}
