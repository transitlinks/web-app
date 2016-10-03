import DataType from 'sequelize';
import Model from '../sequelize';

const TransportType = Model.define('TransportType', {

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
  
  slug: {
    type: DataType.STRING
  }

}, {

  indexes: [
    { fields: [ 'id', 'uuid', 'slug' ] },
  ]

});

export default TransportType;
