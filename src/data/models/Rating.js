import DataType from 'sequelize';
import Model from '../sequelize';

const Rating = Model.define('Rating', {

  id: {
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  }, 

  weight: {
    type: DataType.INTEGER
  },

  property: {
    type: DataType.STRING
  },

  rating: {
    type: DataType.INTEGER
  }

}, {

  indexes: [
    { fields: [ 'id' ] },
  ],

});

export default Rating;
