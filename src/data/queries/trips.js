import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/trips');

import {
  checkInRepository,
  tripRepository, userRepository,
} from '../source';
import TripType, { TripInputType } from '../types/TripType';
import { requireOwnership, throwMustBeLoggedInError } from './utils';
import { GraphQLList, GraphQLString } from 'graphql';
import ProfileType from '../types/ProfileType';


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

      let existingTrip = null;
      if (trip.uuid) {
        existingTrip = await tripRepository.getTrip({ uuid: trip.uuid });
        if (existingTrip) await requireOwnership(request, existingTrip, clientId);
      }

      const firstCheckIn = await checkInRepository.getCheckIn({ uuid: trip.firstCheckInUuid });
      const userId = await requireOwnership(request, firstCheckIn, clientId);

      const lastCheckIn = await checkInRepository.getCheckIn({ uuid: trip.lastCheckInUuid });
      await requireOwnership(request, lastCheckIn, clientId);

      const newTrip = {
        userId,
        firstCheckInId: firstCheckIn.id,
        lastCheckInId: lastCheckIn.id,
        name: trip.name
      };

      const savedTrip = await tripRepository.saveTrip(newTrip);

      return savedTrip.json();

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

