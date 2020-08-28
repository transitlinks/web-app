import DataType from 'sequelize';
import Model from '../sequelize';

const Trip = Model.define('Trip', {

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

  name: {
    type: DataType.STRING,
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
    { fields: ['id', 'uuid' ] },
  ],

});

export default Trip;
