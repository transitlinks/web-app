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
  }

}, {

  indexes: [
    { fields: [ 'id', 'uuid' ] },
  ],

});

export default LinkInstance;
