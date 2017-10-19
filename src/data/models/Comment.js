import DataType from 'sequelize';
import Model from '../sequelize';

const Comment = Model.define('Comment', {

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

  text: {
    type: DataType.STRING
  },
  
  up: {
    type: DataType.INTEGER
  },
  
  down: {
    type: DataType.INTEGER
  }

}, {

  instanceMethods: {
    json: function() {
      const json = this.toJSON();
      delete json.id;
      delete json.userId;
      const user = this.get('user');
      if (user) {
        json.user = user.json();  
      }
      return json;
    }
  },

  indexes: [
    { fields: [ 'id', 'uuid' ] },
  ],

});

export default Comment;
