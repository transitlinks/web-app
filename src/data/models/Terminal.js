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
    { fields: ['id', 'uuid', 'type', 'transport'] },
  ],

});

export default Terminal;
