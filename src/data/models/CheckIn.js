import DataType from 'sequelize';
import Model from '../sequelize';

const CheckIn = Model.define('CheckIn', {

  id: {
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  uuid: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    unique: true,
  },

  clientId: {
    type: DataType.STRING
  },

  latitude: {
    type: DataType.FLOAT
  },

  longitude: {
    type: DataType.FLOAT
  }

}, {

  instanceMethods: {
    json: function() {
      const json = this.toJSON();
      delete json.id;
      return json;
    }
  },

  indexes: [
    { fields: ['id', 'uuid', 'latitude', 'longitude'] },
  ],

});

export default CheckIn;
