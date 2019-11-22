import DataType from 'sequelize';
import Model from '../sequelize';

const Tag = Model.define('Tag', {

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

  value: {
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
    { fields: [ 'id', 'uuid', 'value' ] },
  ],

});

export default Tag;
