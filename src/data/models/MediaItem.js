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

  hosting: {
    type: DataType.STRING
  },

  thumbnail: {
    type: DataType.STRING
  },

  flag: {
    type: DataType.BOOLEAN
  },

  uploadStatus: {
    type: DataType.STRING
  },

  uploadProgress: {
    type: DataType.FLOAT,
    defaultValue: 0
  },

  fileSize: {
    type: DataType.FLOAT,
    defaultValue: 0
  },

  latitude: {
    type: DataType.FLOAT
  },

  longitude: {
    type: DataType.FLOAT
  },

  altitude: {
    type: DataType.INTEGER
  },

  date: {
    type: DataType.DATE
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
