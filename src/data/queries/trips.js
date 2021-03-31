import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/trips');

import { getDistance } from 'geolib';
import {
  checkInRepository,
  tripRepository,
  userRepository,
  terminalRepository
} from '../source';
import TripType, { TripInputType, TripCoordInputType, TripCoordType } from '../types/TripType';
import { requireOwnership, throwMustBeLoggedInError } from './utils';
import { GraphQLList, GraphQLString } from 'graphql';


export const TripMutationFields = {

  tripCoord: {

    type: TripCoordType,
    description: 'Save a trip coord',
    args: {
      tripCoord: { type: TripCoordInputType },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { tripCoord, clientId }) => {

      log.info(`graphql-request=save-trip-coord user=${request.user ? request.user.uuid : null} lat=${tripCoord.latitude} lng=${tripCoord.longitude}`);

      if (!request.user) throw new Error('Trip logging for logged in users only');

      const userId = await userRepository.getUserIdByUuid(request.user.uuid);
      const lastTrip = await tripRepository.getLastUserTrip(userId);
      if (lastTrip && !lastTrip.lastCheckInId) {
        const savedTripCoord = await tripRepository.saveTripCoord({ userId, ...tripCoord });
        const firstCheckIn = await checkInRepository.getCheckIn({ id: lastTrip.firstCheckInId });
        const lastTerminal = await terminalRepository.getTerminal({ userId, createdAt: { $gte: firstCheckIn.createdAt } }, { order: [[ 'createdAt', 'DESC' ]], limit: 1 });
        let coordsSince = firstCheckIn.createdAt;
        if (lastTerminal) {
          coordsSince = lastTerminal.createdAt;
        }
        const tripCoords = await tripRepository.getTripCoords({ userId, createdAt: { $gte: coordsSince }}, { order: [[ 'createdAt', 'DESC' ]] });
        const allTripCoords = [savedTripCoord, ...tripCoords];
        console.log('all trip coords size:', allTripCoords.length);
        if (allTripCoords.length > 10) {
          let distances = [];
          for (let i = 0; i < allTripCoords.length - 2; i++) {
            const from = allTripCoords[i];
            const to = allTripCoords[i + 2];
            const distance = getDistance(from.toJSON(), to.toJSON());
            distances.push({ distance, index: i + 1 });
          }
          distances = distances.sort((a, b) => a.distance - b.distance);
          const removeIndexes = distances.slice(0, allTripCoords.length - 10).map(d => allTripCoords[d.index].id);
          console.log('remove indexes:', removeIndexes);
          await tripRepository.deleteTripCoords({ id: removeIndexes });
        }
        return savedTripCoord.toJSON();
      }

      return null;

    }

  },

  trip: {

    type: TripType,
    description: 'Save a trip',
    args: {
      trip: { type: TripInputType },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { trip, clientId }) => {

      log.info(`graphql-request=save-trip user=${request.user ? request.user.uuid : null} uuid=${trip.uuid}`);

      if (!request.user) throwMustBeLoggedInError();


      const newTrip = {};

      let existingTrip = null;
      let userId = null;
      if (trip.uuid) {
        existingTrip = await tripRepository.getTrip({ uuid: trip.uuid });
        if (existingTrip) {
          userId = await requireOwnership(request, existingTrip, clientId);
          newTrip.uuid = trip.uuid;
        }
      }

      if (trip.firstCheckInUuid) {
        const firstCheckIn = await checkInRepository.getCheckIn({ uuid: trip.firstCheckInUuid });
        newTrip.firstCheckInId = firstCheckIn.id;
        userId = await requireOwnership(request, firstCheckIn, clientId);
      }

      if (trip.lastCheckInUuid) {
        const lastCheckIn = await checkInRepository.getCheckIn({ uuid: trip.lastCheckInUuid });
        newTrip.lastCheckInId = lastCheckIn.id;
        userId = await requireOwnership(request, lastCheckIn, clientId);
      }

      newTrip.userId = userId;
      if (trip.name) newTrip.name = trip.name;


      const savedTrip = await tripRepository.saveTrip(newTrip);

      return savedTrip.toJSON();

    }

  },

  deleteTrip: {

    type: TripType,
    description: 'Delete a trip',
    args: {
      uuid: { type: GraphQLString },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid, clientId }) => {

      log.info(`graphql-request=delete-trip user=${request.user ? request.user.uuid : null} uuid=${uuid}`);

      if (!request.user) throwMustBeLoggedInError();

      const trip = await tripRepository.getTrip({ uuid });

      if (trip) {
        await requireOwnership(request, trip, clientId);
        await tripRepository.deleteTrip({ id: trip.id });
      } else {
        throw new Error('Could not find trip to delete by uuid ' + uuid);
      }

      return trip.toJSON();

    }

  }

};

export const TripQueryFields = {

  trips: {

    type: new GraphQLList(TripType),
    description: 'Basic user info',
    args: {
      user: { type: GraphQLString }
    },
    resolve: async ({ request }, { user }) => {
      const userId = await userRepository.getUserIdByUuid(user);
      const trips = await tripRepository.getTrips({ userId });
      return trips.map(trip => trip.toJSON());
    }

  },

  activeTrip: {
    type: TripType,
    description: 'The last trip of the user',
    resolve: async ({ request }) => {
      if (!request.user) return null;
      const userId = await userRepository.getUserIdByUuid(request.user.uuid);
      const lastTrip = await tripRepository.getLastUserTrip(userId);
      return (lastTrip && !lastTrip.lastCheckInId) ? lastTrip.toJSON() : null;
    }
  }

};

