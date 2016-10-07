import LocalityType from './LocalityType';
import TransportTypeType from './TransportTypeType';
import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

export const LinkInstanceType = new GraphQLObjectType({
  name: 'LinkInstance',
  description: 'An instance of travel between places in the link.',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    link: { type: TransitLinkType },
    transport: { type: TransportTypeType },
    departureDate: { type: GraphQLString },
    departureHour: { type: GraphQLInt },
    departureMinute: { type: GraphQLInt },
    departurePlace: { type: GraphQLString },
    arrivalDate: { type: GraphQLString },
    arrivalHour: { type: GraphQLInt },
    arrivalMinute: { type: GraphQLInt },
    arrivalPlace: { type: GraphQLString },
    priceAmount: { type: GraphQLFloat },
    priceCurrency: { type: GraphQLString },
    description: { type: GraphQLString }
  })
});

export const LinkInstanceInputType = new GraphQLInputObjectType({
  name: 'LinkInstanceInput',
  description: 'Input properties for LinkInstance.',
  fields: () => ({
    id: { type: GraphQLInt },
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    transport: { type: new GraphQLNonNull(GraphQLString) },
    departureDate: { type: GraphQLString },
    departureHour: { type: GraphQLInt },
    departureMinute: { type: GraphQLInt },
    departurePlace: { type: GraphQLString },
    arrivalDate: { type: GraphQLString },
    arrivalHour: { type: GraphQLInt },
    arrivalMinute: { type: GraphQLInt },
    arrivalPlace: { type: GraphQLString },
    priceAmount: { type: GraphQLFloat },
    priceCurrency: { type: GraphQLString },
    description: { type: GraphQLString }
  })
});

export const TransitLinkType = new GraphQLObjectType({
  name: 'TransitLink',
  description: 'Transitlink between two localities.',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    from: { type: LocalityType },
    to: { type: LocalityType },
    instances: { type: new GraphQLList(LinkInstanceType) }
  })
});

export const TransitLinkInputType = new GraphQLInputObjectType({
  name: 'TransitLinkInput',
  description: 'Input properties for TransitLink.',
  fields: () => ({
    id: { type: GraphQLInt },
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) }
  })
});

export default TransitLinkType;
