import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull, GraphQLInputObjectType, GraphQLInt,
} from 'graphql';

export const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'Transitlinks Post object',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    text: { type: new GraphQLNonNull(GraphQLString) }
  },
});

export const PostInputType = new GraphQLInputObjectType({
  name: 'PostInput',
  description: 'Input properties of Transitlinks Post object',
  fields: {
    text: { type: GraphQLString }
  }
});

export default PostType;
