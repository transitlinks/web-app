import DataType from 'sequelize';
import Model from '../sequelize';

const EntityTag = Model.define('EntityTag', {

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

  entity: {
    type: DataType.STRING
  },

  userUuid: {
    type: DataType.STRING
  },

  locality: {
    type: DataType.STRING
  },

  country: {
    type: DataType.STRING
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
    { fields: [ 'id', 'uuid', 'entity', 'userUuid' ] },
  ],

});

export default EntityTag;
