import DataType from 'sequelize';
import Model from '../sequelize';

const TransitLink = Model.define('TransitLink', {

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

  instanceMethods: {
    json: function() {
      return {
        uuid: this.get('uuid'),
        slug: this.get('slug')
      };
    }
  },

  indexes: [
    { fields: ['id', 'uuid', 'slug'] },
  ],

});

export default TransitLink;
