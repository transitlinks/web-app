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
  
  departure: {
    type: DataType.DATE
  },

  arrival: {
    type: DataType.DATE
  },

  duration: {
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
