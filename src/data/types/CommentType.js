import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean
} from 'graphql';
import { UserType } from './UserType';

export const CommentType = new GraphQLObjectType({
  name: 'Comment',
  description: 'User comment to a link instance.',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    linkInstanceUuid: { type: GraphQLString },
    text: { type: GraphQLString },
    user: { type: UserType },
    createdAt: { type: GraphQLString }
  })
});

export const CommentInputType = new GraphQLInputObjectType({
  name: 'CommentInput',
  description: 'Input properties for Comment.',
  fields: () => ({
    uuid: { type: GraphQLString },
    linkInstanceUuid: { type: GraphQLString },
    text: { type: GraphQLString }
  })
});

export default CommentType;
