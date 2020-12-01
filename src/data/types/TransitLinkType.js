
import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLFloat, GraphQLInt,
} from 'graphql';
import CommentType from './CommentType';

export const LatLngType = new GraphQLObjectType({
  name: 'LatLng',
  description: 'A lat/lng point',
  fields: () => ({
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat }
  })
});

export const LinkTagType = new GraphQLObjectType({
  name: 'LinkTag',
  description: 'A tag related to a link',
  fields: () => ({
    tag: { type: GraphQLString },
    userUuid: { type: GraphQLString }
  })
});

export const LinkTripType = new GraphQLObjectType({
  name: 'LinkTrip',
  description: 'A trip related to a link',
  fields: () => ({
    uuid: { type: GraphQLString },
    name: { type: GraphQLString }
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
    utcDateTime: { type: GraphQLString },
    localDateTime: { type: GraphQLString },
    routeId: { type: GraphQLInt },
    routeCost: { type: GraphQLInt },
    routeIndex: { type: GraphQLInt },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    localityUuid: { type: GraphQLString },
    locality: { type: GraphQLString },
    priceAmount: { type: GraphQLFloat },
    priceCurrency: { type: GraphQLString },
    formattedAddress: { type: GraphQLString },
    description: { type: GraphQLString },
    country: { type: GraphQLString },
    linkedTerminal: { type: LinkTerminalType },
    linkCount: { type: GraphQLInt },
    reverseLinkCount: { type: GraphQLInt },
    route: { type: new GraphQLList(LatLngType) },
    tags: { type: new GraphQLList(LinkTagType) },
    trips: { type: new GraphQLList(LinkTripType) },
    comments: { type: new GraphQLList(CommentType) }
  })
});


export const LinkedLocalityResultType = new GraphQLObjectType({
  name: 'LinkedLocalityResult',
  description: 'Basic info about linked locality',
  fields: () => ({
    localityUuid: { type: GraphQLString },
    locality: { type: GraphQLString },
    linkedLocality: { type: GraphQLString },
    linkedLocalityUuid: { type: GraphQLString },
    linkedTerminalType: { type: GraphQLString },
    from: { type: GraphQLString },
    to: { type: GraphQLString },
    linkedTerminalUuid: { type: GraphQLString },
    linkedLocalityLatitude: { type: GraphQLFloat },
    linkedLocalityLongitude: { type: GraphQLFloat },
    linkCount: { type: GraphQLInt }
  })
});

export const TransitLinkType = new GraphQLObjectType({
  name: 'TransitLink',
  description: 'Transitlink between two localities.',
  fields: () => ({
    localityUuid: { type: GraphQLString },
    locality: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    routeCost: { type: GraphQLInt },
    routeId: { type: GraphQLInt },
    departures: { type: new GraphQLList(LinkTerminalType) },
    arrivals: { type: new GraphQLList(LinkTerminalType) },
    internal: { type: new GraphQLList(LinkTerminalType) },
    departureCount: { type: GraphQLInt },
    arrivalCount: { type: GraphQLInt },
    linkedDepartures: { type: new GraphQLList(LinkedLocalityResultType) },
    linkedArrivals: { type: new GraphQLList(LinkedLocalityResultType) },
    tags: { type: new GraphQLList(LinkTagType) },
    trips: { type: new GraphQLList(LinkTripType) }
  })
});

export const LinkSearchResultType = new GraphQLObjectType({
  name: 'LinkSearchResults',
  description: 'Transitlink search result.',
  fields: () => ({
    searchResultType: { type: GraphQLString },
    localityUuid: { type: GraphQLString },
    locality: { type: GraphQLString },
    linkedLocality: { type: GraphQLString },
    linkedLocalityUuid: { type: GraphQLString },
    from: { type: GraphQLString },
    to: { type: GraphQLString },
    user: { type: GraphQLString },
    userImage: { type: GraphQLString },
    tripName: { type: GraphQLString },
    links: { type: new GraphQLList(TransitLinkType) }
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
