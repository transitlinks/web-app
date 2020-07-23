import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull, GraphQLInputObjectType, GraphQLInt, GraphQLList,
} from 'graphql';

import {
  PostType,
  TerminalType,
  FeedItemType
} from "./PostType";

export const DiscoveryItemType = new GraphQLObjectType({
  name: 'DiscoveryItem',
  description: 'Transitlinks Discovery Item object',
  fields: () => ({
    groupType: { type: GraphQLString },
    groupName: { type: GraphQLString },
    checkInCount: { type: GraphQLInt },
    postCount: { type: GraphQLInt },
    feedItem: { type: FeedItemType },
    posts: { type: new GraphQLList(PostType) },
    connectionsFrom: { type: new GraphQLList(GraphQLString) },
    connectionsTo: { type: new GraphQLList(GraphQLString) }
  })
});

export const DiscoveryResultType = new GraphQLObjectType({
  name: 'DiscoveryResult',
  description: 'Collection of Transitlinks Discovery Item objects',
  fields: () => ({
    discoveries: { type: new GraphQLList(DiscoveryItemType) },
    localityOffset: { type: GraphQLInt },
    tagOffset: { type: GraphQLInt },
    userOffset: { type: GraphQLInt }
  })
});

export default DiscoveryResultType;
