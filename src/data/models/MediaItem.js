import DataType from 'sequelize';
import Model from '../sequelize';

const MediaItem = Model.define('MediaItem', {

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

  entityUuid: {
    type: DataType.STRING
  },
    
  type: {
    type: DataType.STRING
  },

  url: {
    type: DataType.STRING
  },
  
  thumbnail: {
    type: DataType.STRING
  },

  flag: {
    type: DataType.BOOLEAN
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

export default MediaItem;
