import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,

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

export default TripType;
