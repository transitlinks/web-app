import LocalityType from './LocalityType';
import TransportTypeType from './TransportTypeType';
import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean
} from 'graphql';

export const LinkInstanceType = new GraphQLObjectType({
  name: 'LinkInstance',
  description: 'An instance of travel between places in the link.',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    privateUuid: { type: GraphQLString },
    link: { type: TransitLinkType },
    transport: { type: TransportTypeType },
    mode: { type: GraphQLString },
    identifier: { type: GraphQLString },
    departureDate: { type: GraphQLString },
    departureHour: { type: GraphQLInt },
    departureMinute: { type: GraphQLInt },
    departureDescription: { type: GraphQLString },
    departureLat: { type: GraphQLFloat },
    departureLng: { type: GraphQLFloat },
    departureAddress: { type: GraphQLString },
    arrivalDate: { type: GraphQLString },
    arrivalHour: { type: GraphQLInt },
    arrivalMinute: { type: GraphQLInt },
    arrivalDescription: { type: GraphQLString },
    arrivalLat: { type: GraphQLFloat },
    arrivalLng: { type: GraphQLFloat },
    arrivalAddress: { type: GraphQLString },
    priceAmount: { type: GraphQLFloat },
    priceCurrency: { type: GraphQLString },
    description: { type: GraphQLString },
    avgAvailabilityRating: { type: GraphQLFloat },
    avgDepartureRating: { type: GraphQLFloat },
    avgArrivalRating: { type: GraphQLFloat },
    avgAwesomeRating: { type: GraphQLFloat },
    avgRating: { type: GraphQLFloat },
    upVotes: { type: GraphQLInt },
    downVotes: { type: GraphQLInt },
    durationMinutes: { type: GraphQLInt },
    isPrivate: { type: GraphQLBoolean } 
  })
});

export const LinkInstanceInputType = new GraphQLInputObjectType({
  name: 'LinkInstanceInput',
  description: 'Input properties for LinkInstance.',
  fields: () => ({
    uuid: { type: GraphQLString },
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    transport: { type: new GraphQLNonNull(GraphQLString) },
    mode: { type: GraphQLString },
    identifier: { type: GraphQLString },
    durationDays: { type: GraphQLInt },
    durationHours: { type: GraphQLInt },
    durationMinutes: { type: GraphQLInt },
    departureDate: { type: GraphQLString },
    departureHour: { type: GraphQLInt },
    departureMinute: { type: GraphQLInt },
    departureDescription: { type: GraphQLString },
    departureLat: { type: GraphQLFloat },
    departureLng: { type: GraphQLFloat },
    departureAddress: { type: GraphQLString },
    arrivalDate: { type: GraphQLString },
    arrivalHour: { type: GraphQLInt },
    arrivalMinute: { type: GraphQLInt },
    arrivalDescription: { type: GraphQLString },
    arrivalLat: { type: GraphQLFloat },
    arrivalLng: { type: GraphQLFloat },
    arrivalAddress: { type: GraphQLString },
    priceAmount: { type: GraphQLFloat },
    priceCurrency: { type: GraphQLString },
    description: { type: GraphQLString },
    availabilityRating: { type: GraphQLInt },
    departureRating: { type: GraphQLInt },
    arrivalRating: { type: GraphQLInt },
    awesomeRating: { type: GraphQLInt }
  })
});

export const TransitLinkType = new GraphQLObjectType({
  name: 'TransitLink',
  description: 'Transitlink between two localities.',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    from: { type: LocalityType },
    to: { type: LocalityType },
    instances: { type: new GraphQLList(LinkInstanceType) },
    instanceCount: { type: GraphQLInt }
  })
});

export const TransitLinkInputType = new GraphQLInputObjectType({
  name: 'TransitLinkInput',
  description: 'Input properties for TransitLink.',
  fields: () => ({
    uuid: { type: GraphQLString },
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) }
  })
});

export default TransitLinkType;
