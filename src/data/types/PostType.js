import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull, GraphQLInputObjectType, GraphQLInt, GraphQLList,
} from 'graphql';
import {CommentType} from "./CommentType";

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
    text: { type: GraphQLString }
  }
});

export default PostType;
