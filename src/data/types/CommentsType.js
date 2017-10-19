import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';
import { CommentType } from './CommentType';

const CommentsType = new GraphQLObjectType({
  name: 'Comments',
  fields: {
    comments: { type: new GraphQLList(CommentType) }
  },
});

export default CommentsType;
