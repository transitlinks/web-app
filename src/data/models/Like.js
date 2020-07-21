import DataType from 'sequelize';
import Model from '../sequelize';

const Like = Model.define('Like', {

  id: {
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  entityId: {
    type: DataType.INTEGER
  },

  entityType: {
    type: DataType.STRING
  }

}, {

  indexes: [
    { fields: [ 'id', 'entityId', 'entityType', 'userId' ] },
  ],

});

export default Like;
