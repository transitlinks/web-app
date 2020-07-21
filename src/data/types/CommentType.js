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
    replyToUuid: { type: GraphQLString },
    linkInstanceUuid: { type: GraphQLString },
    text: { type: GraphQLString },
    user: { type: UserType },
    up: { type: GraphQLInt },
    down: { type: GraphQLInt },
    createdAt: { type: GraphQLString }
  })
});

export const CommentInputType = new GraphQLInputObjectType({
  name: 'CommentInput',
  description: 'Input properties for Comment.',
  fields: () => ({
    uuid: { type: GraphQLString },
    linkInstanceUuid: { type: GraphQLString },
    replyToUuid: { type: GraphQLString },
    text: { type: GraphQLString }
  })
});

export const LikeResultType = new GraphQLObjectType({
  name: 'LikeResult',
  description: 'Total entity comments',
  fields: () => ({
    entityType: { type: GraphQLString },
    entityUuid: { type: GraphQLString },
    onOff: { type: GraphQLString },
    likes: { type: GraphQLInt }
  })
});

export const CommentVoteType = new GraphQLObjectType({
  name: 'CommentVote',
  description: 'Info on comment votes',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    up: { type: GraphQLInt },
    down: { type: GraphQLInt }
  })
});

export const CommentVoteInputType = new GraphQLInputObjectType({
  name: 'CommentVoteInput',
  description: 'Input object for comment vote',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    value: { type: GraphQLInt }
  })
});

export default CommentType;
