import { getLog } from '../../core/log';
const log = getLog('data/source/tripRepository');

import sequelize from '../sequelize';
import { Trip } from '../models';

export default {

  saveTrip: async (tripInput) => {

    const { id, uuid } = tripInput;

    if (id || uuid) {

      const query = id ? { id } : { uuid };
      const trip = await Trip.findOne({ where: query });
      if (!trip) throw new Error(`Failed to update trip. Trip ${id || uuid} not found`);

      delete tripInput.id;
      delete tripInput.uuid;
      await Trip.update(tripInput, { where: query });

      return await Trip.findOne({ where: query, include: [{ all: true }] });

    } else {

      const created = await Trip.create(tripInput);
      return await Trip.findOne({ where: { id: created.id }, include: [{ all: true }] });

    }

  },

  getTrip: async (where, options = {}) => {

    const trip = await Trip.findOne({
      where,
      include: [{ all: true }],
      ...options
    });

    return trip;

  },

  getTrips: async (where, options = {}) => {

    const trips = await Trip.findAll({
      where,
      include: [{ all: true }],
      ...options
    });

    return trips;

  },

};
