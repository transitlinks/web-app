'use strict';

module.exports = {
  up: function (queryInterface, Sequelize, done) {

    queryInterface.addColumn(
      'LinkInstance',
      'votes',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
    
    queryInterface.addColumn(
      'Rating',
      'userId',
      {
        type: Sequelize.INTEGER,
        references: { model: 'User', key: 'id' }
      }
    );

    done();

  },

  down: function (queryInterface, Sequelize, done) {
    
    queryInterface.removeColumn('LinkInstance', 'votes'); 
    queryInterface.removeColumn('Rating', 'userId'); 

    done();

  }
};
