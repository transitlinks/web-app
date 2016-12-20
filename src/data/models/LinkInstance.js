import DataType from 'sequelize';
import Model from '../sequelize';

const LinkInstance = Model.define('LinkInstance', {

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
  
  privateUuid: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    unique: true
  },
  
  mode: {
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'research'
  },
  
  departureDate: {
    type: DataType.STRING(10)
  },
  
  departureHour: {
    type: DataType.INTEGER
  },
  
  departureMinute: {
    type: DataType.INTEGER
  },
  
  departurePlace: {
    type: DataType.STRING
  },

  arrivalDate: {
    type: DataType.STRING(10)
  },
  
  arrivalHour: {
    type: DataType.INTEGER
  },
  
  arrivalMinute: {
    type: DataType.INTEGER
  },

  arrivalPlace: {
    type: DataType.STRING
  },
  
  durationDays: {
    type: DataType.INTEGER
  },
  
  durationHours: {
    type: DataType.INTEGER
  },
  
  durationMinutes: {
    type: DataType.INTEGER
  },
  
  plusDays: {
    type: DataType.INTEGER
  },

  priceAmount: {
    type: DataType.DECIMAL
  },

  priceCurrency: {
    type: DataType.CHAR(3)
  },

  description: {
    type: DataType.TEXT
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
    { fields: [ 'id', 'uuid' ] },
  ],

});

export default LinkInstance;
