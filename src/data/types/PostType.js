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
    text: { type: GraphQLString }
  }
});

export const CheckInType = new GraphQLObjectType({
  name: 'CheckIn',
  description: 'Transitlinks CheckIn object',
  fields: {
    checkIn: {
      uuid: {type: new GraphQLNonNull(GraphQLString)},
      clientId: {type: GraphQLString},
      latitude: {type: GraphQLFloat},
      longitude: {type: GraphQLFloat}
    },
    posts: { type: new GraphQLList(PostType) }
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
    longitude: { type: GraphQLFloat }
  }
});

export default PostType;
