import DataType from 'sequelize';
import Model from '../sequelize';

const User = Model.define('User', {

  id: {
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  
  uuid: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    unique: true
  },

  email: {
    type: DataType.STRING(255),
    validate: { isEmail: true },
  },

  emailConfirmed: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },
  
  photo: {
    type: DataType.STRING
  }

}, {
  
  instanceMethods: {
    json: function() {
      return {
        uuid: this.get('uuid'),
        email: this.get('email'),
        photo: this.get('photo')
      };
    }
  },

  indexes: [
    { fields: ['email'] },
  ],

});

export default User;
