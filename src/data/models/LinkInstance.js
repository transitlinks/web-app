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
  
  departureDate: {
    type: DataType.DATEONLY
  },
  
  departureHour: {
    type: DataType.INTEGER
  },
  
  departureMinute: {
    type: DataType.INTEGER
  },

  arrivalDate: {
    type: DataType.DATEONLY
  },
  
  arrivalHour: {
    type: DataType.INTEGER
  },
  
  arrivalMinute: {
    type: DataType.INTEGER
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

  price: {
    type: DataType.DECIMAL
  },

  currency: {
    type: DataType.CHAR(3)
  },

  description: {
    type: DataType.TEXT
  }

}, {

  indexes: [
    { fields: [ 'id', 'uuid' ] },
  ],

});

export default LinkInstance;
