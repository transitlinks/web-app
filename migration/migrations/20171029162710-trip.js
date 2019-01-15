'use strict';

module.exports = {
  
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('LinkInstance', 'tripId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Trip',
        key: 'id'
      }
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('LinkInstance', 'tripId');
  }

};
