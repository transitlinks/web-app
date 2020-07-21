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

  placeId: {
    type: DataType.STRING
  },

  locality: {
    type: DataType.STRING
  },

  country: {
    type: DataType.STRING
  },

  formattedAddress: {
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
      const json = {
        ...this.toJSON(),
        tags: (this.tags || []).map(tag => tag.value)
      };
      delete json.id;
      return json;
    }
  },

  indexes: [
    { fields: ['id', 'uuid', 'clientId', 'placeId', 'nextCheckInId', 'prevCheckInId', 'latitude', 'longitude'] },
  ],

});

export default CheckIn;
