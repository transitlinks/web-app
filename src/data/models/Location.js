import DataType from 'sequelize';
import Model from '../sequelize';

const Location = Model.define('Location', {

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
    type: DataType.STRING
  },

  description: {
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
    { fields: ['id', 'uuid', 'name'] },
  ],

});

export default Location;
