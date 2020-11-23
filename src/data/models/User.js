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

  username: {
    type: DataType.STRING
  },

  firstName: {
    type: DataType.STRING
  },

  lastName: {
    type: DataType.STRING
  },

  password: {
    type: DataType.STRING
  },

  resetPasswordCode: {
    type: DataType.STRING
  },

  emailConfirmed: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  photo: {
    type: DataType.STRING
  },

  logins: {
    type: DataType.INTEGER,
    defaultValue: 0
  },

  avatar: {
    type: DataType.STRING
  },

  avatarSource: {
    type: DataType.STRING
  },

  avatarX: {
    type: DataType.FLOAT
  },

  avatarY: {
    type: DataType.FLOAT
  },

  avatarScale: {
    type: DataType.FLOAT
  },

}, {

  instanceMethods: {
    json: function() {
      return {
        uuid: this.get('uuid'),
        email: this.get('email'),
        username: this.get('username'),
        photo: this.get('photo'),
        avatar: this.get('avatar'),
        avatarSource: this.get('avatarSource'),
        avatarX: this.get('avatarX'),
        avatarY: this.get('avatarY'),
        avatarScale: this.get('avatarScale')
      };
    }
  },

  indexes: [
    { fields: ['email'] },
  ],

});

export default User;
