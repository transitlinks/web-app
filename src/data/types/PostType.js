import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull, GraphQLInputObjectType, GraphQLInt, GraphQLList,
} from 'graphql';

export const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'Transitlinks Post object',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    text: { type: GraphQLString }
  },
});

export const PostsType = new GraphQLObjectType({
  name: 'Posts',
  description: 'Transitlinks Posts query result object',
  fields: {
    posts: { type: new GraphQLList(PostType) }
  },
});


export const PostInputType = new GraphQLInputObjectType({
  name: 'PostInput',
  description: 'Input properties of Transitlinks Post object',
  fields: {
    checkInUuid: { type: GraphQLString },
    text: { type: GraphQLString },
    type: { type: GraphQLString },
    clientId: { type: GraphQLString }
  }
});

export const TerminalType = new GraphQLObjectType({
  name: 'Terminal',
  description: 'Transitlinks Terminal object',
  fields: () => {
    return {
      uuid: { type: new GraphQLNonNull(GraphQLString)},
      type: { type: GraphQLString},
      transport: { type: GraphQLString},
      transportId: { type: GraphQLString},
      date: { type: GraphQLString},
      time: { type: GraphQLString},
      priceAmount: { type: GraphQLFloat},
      priceCurrency: { type: GraphQLString},
      linkedTerminal: { type: TerminalType },
      checkIn: { type: CheckInType }
    };
  },
});

export const TerminalInputType = new GraphQLInputObjectType({
  name: 'TerminalInput',
  description: 'Input properties of Transitlinks Terminal object',
  fields: {
    checkInUuid: { type: GraphQLString },
    linkedTerminalUuid: { type: GraphQLString },
    clientId: { type: GraphQLString },
    type: { type: GraphQLString },
    transport: { type: GraphQLString },
    transportId: { type: GraphQLString },
    date: { type: GraphQLString },
    time: { type: GraphQLString },
    priceAmount: { type: GraphQLFloat },
    priceCurrency: { type: GraphQLString }
  }
});

export const CheckInType = new GraphQLObjectType({
  name: 'CheckIn',
  description: 'Transitlinks CheckIn object',
  fields: {
    uuid: {type: new GraphQLNonNull(GraphQLString)},
    clientId: {type: GraphQLString},
    latitude: {type: GraphQLFloat},
    longitude: {type: GraphQLFloat},
    placeId: {type: GraphQLString},
    locality: {type: GraphQLString},
    country: {type: GraphQLString},
    formattedAddress: {type: GraphQLString}
  },
});

export const CheckInsType = new GraphQLObjectType({
  name: 'CheckIns',
  description: 'Transitlinks CheckIns query result object',
  fields: {
    checkIns: { type: new GraphQLList(CheckInType) }
  },
});


export const CheckInInputType = new GraphQLInputObjectType({
  name: 'CheckInInput',
  description: 'Input properties of Transitlinks CheckIn object',
  fields: {
    clientId: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    placeId: {type: GraphQLString},
    locality: {type: GraphQLString},
    country: {type: GraphQLString},
    formattedAddress: {type: GraphQLString}
  }
});

export const FeedItemType = new GraphQLObjectType({
  name: 'FeedItem',
  description: 'Transitlinks FeedItem object',
  fields: {
    checkIn: { type: CheckInType },
    inbound: { type: new GraphQLList(CheckInType) },
    outbound: { type: new GraphQLList(CheckInType) },
    posts: { type: new GraphQLList(PostType) },
    terminals: { type: new GraphQLList(TerminalType) }
  }
});

export const FeedType = new GraphQLObjectType({
  name: 'Feed',
  description: 'Transitlinks Feed query result object',
  fields: {
    feedItems: { type: new GraphQLList(FeedItemType) },
    openTerminals: { type: new GraphQLList(TerminalType) }
  }
});

export default PostType;
