module.exports = (sequelize, DataTypes) =>{
    const Tests = sequelize.define('Tests', {
            id:{
                type:DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement:true,
            },
            childname:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            ssn:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            childid:{
                type: DataTypes.INTEGER,
                allowNull: false,
                references:{
                    model:'children',
                    key:'id',
                },
                onDelete: 'CASCADE',
            },
            userid:{
                type: DataTypes.INTEGER,
                allowNull: false,
                references:{
                    model:'users',
                    key:'id',
                },
                onDelete: 'CASCADE',
            },
            isCompleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            completedDate: {
                type: DataTypes.DATEONLY, 
                allowNull: true
            },
        },
        {
            tableName:'tests',
            //createdAt, updatedAt 자동 생성
            timestamps: true,
        }
    );
    Tests.associate = (db) => {
        Tests.belongsTo(db.Children, {
            foreignKey:'childid',
            targetKey: 'id',
            onDelete: 'CASCADE',
        });
        Tests.belongsTo(db.Users, {
            foreignKey: 'userid',
            targetKey:'id',
            onDelete: 'CASCADE',
        });
    }
    return Tests;
}
