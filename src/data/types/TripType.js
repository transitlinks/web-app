import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull, GraphQLFloat,

} from 'graphql';
import { CheckInType } from './PostType';

export const TripType = new GraphQLObjectType({
  name: 'Trip',
  description: 'Transitlinks Trip',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    firstCheckIn: { type: CheckInType },
    lastCheckIn: { type: CheckInType }
  })
});

export const TripInputType = new GraphQLInputObjectType({
  name: 'TripInput',
  description: 'Input properties for Trip',
  fields: () => ({
    uuid: { type: GraphQLString },
    name: { type: GraphQLString },
    firstCheckInUuid: { type: GraphQLString },
    lastCheckInUuid: { type: GraphQLString }
  })
});

export const TripCoordType = new GraphQLObjectType({
  name: 'TripCoord',
  description: 'Coord point of a trip',
  fields: () => ({
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat }
  })
});

export const TripCoordInputType = new GraphQLInputObjectType({
  name: 'TripCoordInput',
  description: 'Input properties for TripCoord',
  fields: () => ({
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat }
  })
});

export default TripType;
