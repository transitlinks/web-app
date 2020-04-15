import { getLog } from '../../core/log';
const log = getLog('data/source/terminalRepository');

import sequelize from '../sequelize';
import { Terminal } from '../models';

export default {

  getTerminal: async (where, options) => {

    let terminal = await Terminal.findOne({
      where,
      include: [ { all: true } ]
    });

    return terminal;

  },

  getTerminals: async (where, options) => {

    let terminals = await Terminal.findAll({
      where,
      include: [ { all: true } ]
    });

    return terminals;

  },

  getInternalDeparturesByLocality: async (locality) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocality: { $eq: sequelize.col('Terminal.locality') },
        locality,
        type: 'departure'
      },
      include: [{ all: true }]
    });

    return terminals;

  },

  getInterTerminalsByLocality: async (locality) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocality: { $ne: sequelize.col('Terminal.locality') },
        locality
      },
      include: [{ all: true }]
    });

    return terminals;

  },

  saveTerminal: async (terminal) => {

    if (terminal.uuid) {

      const result = await Terminal.update(terminal, {
        where: { uuid: terminal.uuid }
      });

      if (result.length !== 1 || result[0] !== 1) {
        throw new Error(`Invalid terminal update result: ${result}`);
      }

      return await Terminal.findOne({ where: { uuid: terminal.uuid }});

    }

    const created = await Terminal.create(terminal);

    if (!created) {
      throw new Error('Failed to create a terminal (null result)');
    }

    return created;

  }

};
