import DataType from 'sequelize';
import Model from '../sequelize';

const Terminal = Model.define('Terminal', {

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

  checkInUuid: {
    type: DataType.STRING
  },

  type: {
    type: DataType.STRING
  },

  transport: {
    type: DataType.STRING
  },

  transportId: {
    type: DataType.STRING
  },

  description: {
    type: DataType.STRING
  },

  localityUuid: {
    type: DataType.STRING
  },

  locality: {
    type: DataType.STRING
  },

  country: {
    type: DataType.STRING
  },

  latitude: {
    type: DataType.FLOAT
  },

  longitude: {
    type: DataType.FLOAT
  },

  formattedAddress: {
    type: DataType.STRING
  },

  linkedLocalityUuid: {
    type: DataType.STRING
  },

  linkedLocality: {
    type: DataType.STRING
  },

  linkedFormattedAddress: {
    type: DataType.STRING
  },

  date: {
    type: DataType.DATE
  },

  time: {
    type: DataType.DATE
  },

  priceAmount: {
    type: DataType.FLOAT
  },

  priceCurrency: {
    type: DataType.STRING
  }

}, {

  instanceMethods: {
    json: function() {
      const json = { ...this.toJSON() };
      delete json.id;
      return json;
    }
  },

  indexes: [
    { fields: ['id', 'uuid', 'type', 'transport', 'locality', 'latitude', 'longitude', 'checkInUuid'] },
  ],

});

export default Terminal;
