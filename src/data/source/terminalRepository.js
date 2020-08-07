import { getLog } from '../../core/log';
const log = getLog('data/source/terminalRepository');

import sequelize from '../sequelize';
import { Terminal, CheckIn, Post } from '../models';
import postRepository from './postRepository';

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

  getInternalDeparturesByLocality: async (locality, query = {}) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocality: { $eq: sequelize.col('Terminal.locality') },
        locality,
        type: 'departure',
        ...query
      },
      include: [{ all: true }]
    });

    return terminals;

  },

  getLinkedLocalitiesByLocality: async (query = {}) => {

    const linkedLocalities = await Terminal.findAll({
      where: {
        linkedLocality: { $ne: sequelize.col('Terminal.locality') },
        ...query
      },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('linkedLocality')), 'linkedLocality']],
      group: ['Terminal.linkedLocality'],
      raw: true
    });

    return linkedLocalities.map(loc => loc.linkedLocality);

  },

  countInterTerminals: async (query = {}) => {

    const counts = await Terminal.findAll({
      where: {
        linkedLocality: { $ne: sequelize.col('Terminal.locality') },
        ...query
      },
      attributes: ['type', [sequelize.fn('count', sequelize.col('type')), 'count']],
      group: ['Terminal.type'],
      raw: true,
      order: sequelize.literal('count DESC')
    });

    const terminalCounts = {
    };

    for (let i = 0; i < counts.length; i++) {
      terminalCounts[counts[i].type] = counts[i].count;
    }

    return terminalCounts;

  },


  getInterTerminalsByLocality: async (locality, query = {}) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocality: { $ne: sequelize.col('Terminal.locality') },
        locality,
        ...query
      },
      include: [{ all: true }]
    });

    return terminals;

  },

  getInterTerminalsByTag: async (tag, userId) => {

    const checkIns = await CheckIn.findAll({
      where: {
        tag: { $ne: sequelize.col('Terminal.locality') },
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

  },

  deleteTerminal: async (uuid) => {

    const terminal = await Terminal.findOne({ where: { uuid }});

    if (!terminal) {
      throw new Error('Could not find terminal with uuid ' + uuid);
    }

    await terminal.destroy();
    return terminal;

  },

};
