import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import me from './queries/me';
import content from './queries/content';
import localities from './queries/localities';
import { AccountQueryFields } from './queries/account';
import transportTypes from './queries/transportTypes';
import intl from './queries/intl';
import { TransitLinkMutationFields, TransitLinkQueryFields } from './queries/links';
import { PostMutationFields, PostQueryFields } from './queries/posts';
import { CommentMutationFields, CommentQueryFields } from './queries/comments';
import { UserMutationFields, UserQueryFields } from './queries/users';
import { RatingQueryFields, RatingMutationFields, VoteMutationFields } from './queries/ratings';
import * as links from './queries/links';

const schema = new Schema({

  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      content,
      localities,
      profile: AccountQueryFields.profile,
      userLinks: AccountQueryFields.links,
      transportTypes,
      link: TransitLinkQueryFields.link,
      linkInstance: TransitLinkQueryFields.linkInstance,
      links: TransitLinkQueryFields.links,
      linkInstanceMedia: TransitLinkQueryFields.linkInstanceMedia,
      user: UserQueryFields.user,
      ratings: RatingQueryFields.ratings,
      comments: CommentQueryFields.comments,
      posts: PostQueryFields.posts,
      feed: PostQueryFields.feed,
      feedItem: PostQueryFields.feedItem,
      intl
    }
  }),

  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      linkInstance: TransitLinkMutationFields.linkInstance,
      deleteLinkInstance: TransitLinkMutationFields.deleteLinkInstance,
      votes: TransitLinkMutationFields.votes,
      instanceFiles: TransitLinkMutationFields.instanceFiles,
      user: UserMutationFields.user,
      comment: CommentMutationFields.comment,
      commentVote: CommentMutationFields.commentVote,
      rating: RatingMutationFields.rating,
      post: PostMutationFields.post,
      checkIn: PostMutationFields.checkIn,
      deleteCheckIn: PostMutationFields.deleteCheckIn,
      terminal: PostMutationFields.terminal
    },
  })

});

export default schema;
