'use strict';

module.exports = {
  
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('LinkInstance', 'identifier', {
      type: Sequelize.STRING
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('LinkInstance', 'identifier');
  }

};
