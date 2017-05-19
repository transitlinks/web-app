'use strict';

module.exports = {
  
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('LinkInstance', 'deletedAt', {
      type: Sequelize.DATE
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('LinkInstance', 'deletedAt');
  }

};
