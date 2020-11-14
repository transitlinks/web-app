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
import { CheckInQueryFields } from './queries/checkIns';
import { DiscoverQueryFields } from './queries/discover';
import { CommentMutationFields, CommentQueryFields } from './queries/comments';
import { UserMutationFields, UserQueryFields } from './queries/users';
import { TripMutationFields, TripQueryFields } from './queries/trips';

const schema = new Schema({

  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      content,
      localities,
      profile: AccountQueryFields.profile,
      transportTypes,
      linkInstanceMedia: TransitLinkQueryFields.linkInstanceMedia,
      user: UserQueryFields.user,
      comments: CommentQueryFields.comments,
      posts: PostQueryFields.posts,
      post: PostQueryFields.post,
      checkIn: CheckInQueryFields.checkIn,
      feed: PostQueryFields.feed,
      openTerminals: PostQueryFields.openTerminals,
      feedItem: PostQueryFields.feedItem,
      mediaItem: PostQueryFields.mediaItem,
      discover: DiscoverQueryFields.discover,
      transitLinks: TransitLinkQueryFields.transitLinks,
      trips: TripQueryFields.trips,
      activeTrip: TripQueryFields.activeTrip,
      intl
    }
  }),

  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      instanceFiles: TransitLinkMutationFields.instanceFiles,
      user: UserMutationFields.user,
      comment: CommentMutationFields.comment,
      deleteComment: CommentMutationFields.deleteComment,
      like: CommentMutationFields.like,
      post: PostMutationFields.post,
      checkIn: PostMutationFields.checkIn,
      deleteCheckIn: PostMutationFields.deleteCheckIn,
      deletePost: PostMutationFields.deletePost,
      terminal: PostMutationFields.terminal,
      deleteTerminal: PostMutationFields.deleteTerminal,
      mediaItem: PostMutationFields.mediaItem,
      deleteMediaItem: PostMutationFields.deleteMediaItem,
      trip: TripMutationFields.trip,
      tripCoord: TripMutationFields.tripCoord,
      deleteTrip: TripMutationFields.deleteTrip,
    },
  })

});

export default schema;
