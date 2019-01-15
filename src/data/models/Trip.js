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
    unique: true
  },

  name: {
    type: DataType.STRING
  },
  
  description: {
    type: DataType.STRING
  },

  stars: {
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
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

export default Trip;
