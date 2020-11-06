import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/trips');

import {
  checkInRepository,
  tripRepository,
  userRepository,
} from '../source';
import TripType, { TripInputType } from '../types/TripType';
import { requireOwnership, throwMustBeLoggedInError } from './utils';
import { GraphQLList, GraphQLString } from 'graphql';


export const TripMutationFields = {

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

      return savedTrip.json();

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

      return trip.json();

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
      return trips.map(trip => trip.json());

    }

  }

};

