const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const bcrypt = require('bcrypt');

class User extends Model {

    checkPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

User.init(
    {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        
        username: {
          type: DataTypes.STRING,
          allowNull: false
        },

        github: {
            type: DataTypes.STRING,
            allowNull: true
        },
        
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            len: [4]
          }
        }
      },
  {
      hooks: {
        
        async beforeCreate(newUsers) {
            newUsers.password = await bcrypt.hash(newUsers.password, 10);
            return newUsers;
        },
          
        async beforeUpdate(updatedUsers) {
            updatedUsers.password = await bcrypt.hash(updatedUsers.password, 10);
            return updatedUsers;
        }
      },

    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'user'
  }
);

module.exports = User;