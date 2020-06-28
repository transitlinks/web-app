
import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLFloat,
} from 'graphql';

export const LatLngType = new GraphQLObjectType({
  name: 'LatLng',
  description: 'A lat/lng point',
  fields: () => ({
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat }
  })
});

export const LinkTerminalType = new GraphQLObjectType({
  name: 'LinkTerminal',
  description: 'Transitlink endpoint.',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    checkInUuid: { type: GraphQLString },
    type: { type: GraphQLString },
    transport: { type: GraphQLString },
    transportId: { type: GraphQLString },
    date: { type: GraphQLString },
    time: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    locality: { type: GraphQLString },
    priceAmount: { type: GraphQLFloat },
    priceCurrency: { type: GraphQLString },
    formattedAddress: { type: GraphQLString },
    description: { type: GraphQLString },
    country: { type: GraphQLString },
    linkedTerminal: { type: LinkTerminalType },
    route: { type: new GraphQLList(LatLngType) }
  })
});

export const LinkSearchResultType = new GraphQLObjectType({
  name: 'LinkSearchResult',
  description: 'Transitlink between two localities.',
  fields: () => ({
    locality: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    departures: { type: new GraphQLList(LinkTerminalType) },
    arrivals: { type: new GraphQLList(LinkTerminalType) },
    internal: { type: new GraphQLList(LinkTerminalType) }
  })
});

export const LinkType = new GraphQLObjectType({
  name: 'Link',
  description: 'Transitlink between two localities.',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    from: { type: LinkTerminalType },
    to: { type: LinkTerminalType },
    transport: { type: GraphQLString },
    transportId: { type: GraphQLString }
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

export const MediaItemType = new GraphQLObjectType({
  name: 'MediaItem',
  description: 'File upload summary.',
  fields: () => ({
    uuid: { type: GraphQLString },
    type: { type: GraphQLString },
    thumbnail: { type: GraphQLString },
    url: { type: GraphQLString }
  })
});

export default LinkType;
