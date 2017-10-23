'use strict';

module.exports = {
  
  up: function (queryInterface, Sequelize) {
    
    return Promise.all([

      queryInterface.addColumn('User', 'username', { type: Sequelize.STRING }),
      queryInterface.addColumn('User', 'firstName', { type: Sequelize.STRING }),
      queryInterface.addColumn('User', 'lastName', { type: Sequelize.STRING }),
      
    ]);

  },

  down: function (queryInterface, Sequelize) {
    
    return Promise.all([
      
      queryInterface.removeColumn('User', 'username'),
      queryInterface.removeColumn('User', 'firstName'),
      queryInterface.removeColumn('User', 'lastName'),
    
    ]);
 
  }

};
