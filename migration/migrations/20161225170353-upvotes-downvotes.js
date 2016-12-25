'use strict';

module.exports = {
  
  up: function (queryInterface, Sequelize, done) {

    queryInterface.renameColumn('LinkInstance', 'votes', 'upVotes');
    queryInterface.addColumn(
      'LinkInstance',
      'downVotes',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );

    done();

  },

  down: function (queryInterface, Sequelize, done) {
    
    queryInterface.removeColumn('LinkInstance', 'downVotes');
    queryInterface.renameColumn('LinkInstance', 'upVotes', 'votes');
    
    done();

  }

};
