'use strict';

module.exports = {

  up: function (queryInterface, Sequelize) {
    
    return Promise.all([

      queryInterface.renameColumn('LinkInstance', 'arrivalPlace', 'arrivalDescription'),
      queryInterface.addColumn('LinkInstance', 'arrivalLat', { type: Sequelize.FLOAT }),
      queryInterface.addColumn('LinkInstance', 'arrivalLng', { type: Sequelize.FLOAT }),
      queryInterface.addColumn('LinkInstance', 'arrivalAddress', { type: Sequelize.STRING }),
      
      queryInterface.renameColumn('LinkInstance', 'departurePlace', 'departureDescription'),
      queryInterface.addColumn('LinkInstance', 'departureLat', { type: Sequelize.FLOAT }),
      queryInterface.addColumn('LinkInstance', 'departureLng', { type: Sequelize.FLOAT }),
      queryInterface.addColumn('LinkInstance', 'departureAddress', { type: Sequelize.STRING })

    ]);

  },

  down: function (queryInterface, Sequelize) {
    
    return Promise.all([
      
      queryInterface.renameColumn('LinkInstance', 'departureDescription', 'departurePlace'),
      queryInterface.removeColumn('LinkInstance', 'departureLat'),
      queryInterface.removeColumn('LinkInstance', 'departureLng'),
      queryInterface.removeColumn('LinkInstance', 'departureAddress'),
    
      queryInterface.renameColumn('LinkInstance', 'arrivalDescription', 'arrivalPlace'),
      queryInterface.removeColumn('LinkInstance', 'arrivalLat'),
      queryInterface.removeColumn('LinkInstance', 'arrivalLng'),
      queryInterface.removeColumn('LinkInstance', 'arrivalAddress')

    ]);
 
  }

};
