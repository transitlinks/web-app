import DataType from 'sequelize';
import Model from '../sequelize';

const Locality = Model.define('Locality', {

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
    
  apiId: {
    type: DataType.STRING,
    unique: true
  },

  name: {
    type: DataType.STRING
  },

  countryLong: {
    type: DataType.STRING
  },
  
  countryShort: {
    type: DataType.STRING
  },

  description: {
    type: DataType.STRING
  },

  lat: {
    type: DataType.DOUBLE
  },
  
  lng: {
    type: DataType.DOUBLE
  },

}, {

  indexes: [
    { fields: ['id', 'uuid', 'apiId', 'name'] },
  ],

});

export default Locality;
