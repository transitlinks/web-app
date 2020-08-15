import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,

} from 'graphql';
import { UserType } from './UserType';

export const CommentType = new GraphQLObjectType({
  name: 'Comment',
  description: 'User comment to a link instance.',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    replyToUuid: { type: GraphQLString },
    checkInUuid: { type: GraphQLString },
    terminalUuid: { type: GraphQLString },
    text: { type: GraphQLString },
    user: { type: UserType },
    likes: { type: GraphQLInt },
    createdAt: { type: GraphQLString }
  })
});

export const CommentInputType = new GraphQLInputObjectType({
  name: 'CommentInput',
  description: 'Input properties for Comment.',
  fields: () => ({
    uuid: { type: GraphQLString },
    checkInUuid: { type: GraphQLString },
    terminalUuid: { type: GraphQLString },
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


export default CommentType;
