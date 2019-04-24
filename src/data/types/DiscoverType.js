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
    feedItem: { type: FeedItemType },
    posts: { type: new GraphQLList(PostType) },
    departures: { type: new GraphQLList(TerminalType) },
    arrivals: { type: new GraphQLList(TerminalType) }
  })
});

export const DiscoveryResultType = new GraphQLObjectType({
  name: 'DiscoveryResult',
  description: 'Collection of Transitlinks Discovery Item objects',
  fields: () => ({
    discoveries: { type: new GraphQLList(DiscoveryItemType) }
  })
});

export default DiscoveryResultType;
