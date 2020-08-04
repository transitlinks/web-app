import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLBoolean,
} from 'graphql';

export const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'Transitlinks Post object',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    text: { type: GraphQLString },
    user: { type: GraphQLString },
    mediaItems: { type: new GraphQLList(MediaItemType) },
    checkInUuid: { type: GraphQLString },
    checkIn: { type: CheckInType }
  })
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
  fields: () => ({
    uuid: { type: GraphQLString },
    checkInUuid: { type: GraphQLString },
    text: { type: GraphQLString },
    type: { type: GraphQLString },
    clientId: { type: GraphQLString },
    mediaItems: { type: new GraphQLList(MediaItemInputType) },
    tags: { type: new GraphQLList(GraphQLString) }
  })
});

export const TerminalType = new GraphQLObjectType({
  name: 'Terminal',
  description: 'Transitlinks Terminal object',
  fields: () => {
    return {
      uuid: { type: new GraphQLNonNull(GraphQLString)},
      type: { type: GraphQLString },
      transport: { type: GraphQLString },
      transportId: { type: GraphQLString },
      description: { type: GraphQLString },
      date: { type: GraphQLString },
      time: { type: GraphQLString },
      priceAmount: { type: GraphQLFloat },
      priceCurrency: { type: GraphQLString },
      linkedTerminal: { type: TerminalType },
      checkInUuid: { type: GraphQLString },
      checkIn: { type: CheckInType },
      linkCount: { type: GraphQLInt }
    };
  },
});

export const TerminalInputType = new GraphQLInputObjectType({
  name: 'TerminalInput',
  description: 'Input properties of Transitlinks Terminal object',
  fields: {
    uuid: { type: GraphQLString },
    checkInUuid: { type: GraphQLString },
    linkedTerminalUuid: { type: GraphQLString },
    clientId: { type: GraphQLString },
    type: { type: GraphQLString },
    transport: { type: GraphQLString },
    transportId: { type: GraphQLString },
    description: { type: GraphQLString},
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
    checkInUuid: {type: GraphQLString},
    user: { type: GraphQLString },
    userUuid: { type: GraphQLString },
    userImage: { type: GraphQLString },
    latitude: {type: GraphQLFloat},
    longitude: {type: GraphQLFloat},
    placeId: {type: GraphQLString},
    locality: {type: GraphQLString},
    country: {type: GraphQLString},
    formattedAddress: {type: GraphQLString},
    date: {type: GraphQLString},
    tags: {type: new GraphQLList(GraphQLString)},
    likes: { type: GraphQLInt },
    likedByUser: { type: GraphQLBoolean }
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
    uuid: {type: GraphQLString},
    date: {type: GraphQLString},
    clientId: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    placeId: {type: GraphQLString},
    locality: {type: GraphQLString},
    country: {type: GraphQLString},
    formattedAddress: {type: GraphQLString},
    tags: {type: new GraphQLList(GraphQLString)}
  }
});

export const MediaItemInputType = new GraphQLInputObjectType({
  name: 'MediaItemInput',
  description: 'Input properties for MediaItem.',
  fields: () => ({
    entityType: { type: GraphQLString },
    entityUuid: { type: GraphQLString },
    uuid: { type: GraphQLString },
    type: { type: GraphQLString },
    url: { type: GraphQLString },
    thumbnail: { type: GraphQLString },
    uploadStatus: { type: GraphQLString },
    uploadProgress: { type: GraphQLFloat },
    fileSize: { type: GraphQLFloat },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    date: { type: GraphQLString }
  })
});

export const MediaItemType = new GraphQLObjectType({
  name: 'PostMediaItem',
  description: 'File upload summary.',
  fields: () => ({
    uuid: { type: GraphQLString },
    type: { type: GraphQLString },
    thumbnail: { type: GraphQLString },
    url: { type: GraphQLString },
    uploadStatus: { type: GraphQLString },
    uploadProgress: { type: GraphQLFloat },
    fileSize: { type: GraphQLFloat },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    date: { type: GraphQLString }
  })
});

export const FeedItemType = new GraphQLObjectType({
  name: 'FeedItem',
  description: 'Transitlinks FeedItem object',
  fields: {
    userAccess: { type: GraphQLString },
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
    openTerminals: { type: new GraphQLList(TerminalType) },
    user: { type: GraphQLString },
    userImage: { type: GraphQLString }
  }
});

export default PostType;
