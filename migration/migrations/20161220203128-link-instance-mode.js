'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'LinkInstance',
      'mode',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'research'
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('LinkInstance', 'mode'); 
  }
};
