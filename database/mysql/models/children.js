module.exports = (sequelize, DataTypes) =>{
    const Children = sequelize.define('Children', {
            id:{
                type:DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement:true,
            },
            name:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            gender:{
                type : DataTypes.ENUM('female', 'male', '여자', '남자'),
                allowNull: false,
            },
            ssn:{
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
            },
            address:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone_no:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            userid:{
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key:'id',
                },
                onDelete: 'CASCADE',
            }
        },
        {
            tableName:'children',
            timestamps: false
        }
    );
    Children.associate = (db) => {
        Children.belongsTo(db.Users, {
            foreignKey: 'userid',
            targetKey: 'id',
            onDelete: 'CASCADE',
        });
        Children.hasMany(db.Tests, {
            foreignKey:'childid',
            sourceKey:'id',
        });
    }
    return Children;
}
