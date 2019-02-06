import fs from 'fs';
import path from 'path';
import { getLog } from '../../core/log';
const log = getLog('data/queries/posts');

import { getVideos, uploadVideo } from '../../services/youtubeDataApi';

import {
  postRepository,
  userRepository,
  placesApi
} from '../source';

import {
	PostType,
  PostsType,
	PostInputType,
  CheckInType,
  CheckInsType,
  CheckInInputType,
  FeedItemType,
  FeedType
} from '../types/PostType';

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

import { STORAGE_PATH, MEDIA_PATH, MEDIA_URL, APP_URL } from '../../config';

const savePost = async (postInput, request) => {

  const { checkInUuid } = postInput;
  const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
  if (!checkIn) {

  }

  const post = {
    checkInId: checkIn.id,
    text: postInput.text
  };

  const saved = await postRepository.savePost(post);

  return saved.toJSON();

};

export const PostMutationFields = {

  post: {

    type: PostType,
    description: 'Create or update a post',
    args: {
      post: { type: PostInputType }
    },
    resolve: async ({ request }, { post }) => {
      log.info(`graphql-request=create-or-update-post user=${request.user ? request.user.uuid : null}`);
      return await savePost(post, request);
    }

  },

  checkIn: {

    type: CheckInType,
    description: 'Create or update a check-in',
    args: {
      checkIn: { type: CheckInInputType }
    },
    resolve: async ({ request }, { checkIn }) => {
      log.info(`graphql-request=create-or-update-check-in user=${request.user ? request.user.uuid : null}`);
      const savedCheckIn = await postRepository.saveCheckIn({ ...checkIn, userId: request.user ? request.user.id : null });
      return savedCheckIn.toJSON();
    }

  }

};

export const PostQueryFields = {

  post: {

    type: PostType,
    description: 'Find a post by uuid',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {

      log.info(`graphql-request=find-post-by-uuid user=${request.user ? request.user.uuid : null} post-uuid=${uuid}`);
      const post = await postRepository.getPost({ uuid });
      if (!post) {
        throw new Error(`Post (uuid ${uuid}) not found`);
      }

      return post.toJSON();

    }

  },

  posts: {

    type: PostsType,
    description: 'Find posts',
    args: {
      input: { type: GraphQLString }
    },
    resolve: async ({ request }, { input }) => {

      log.info(`graphql-request=find-posts user=${request.user ? request.user.uuid : null}`);
      const posts = await postRepository.getFeedPosts(request.user ? request.user.id : null);
      return { posts: posts.map(post => post.toJSON()) };

    }

  },

  feed: {

    type: FeedType,
    description: 'Query feed',
    args: {
      input: { type: GraphQLString }
    },
    resolve: async ({ request }, { input }) => {

      log.info(`graphql-request=get-feed user=${request.user ? request.user.uuid : null}`);
      const checkIns = await postRepository.getFeedCheckIns(request.user ? request.user.id : null);
      return {
        feedItems: checkIns.map(async (checkIn) => {
          const posts = await postRepository.getPosts({ checkInId: checkIn.id });
          return {
            checkIn: checkIn.toJSON(),
            posts: posts.map(post => post.toJSON())
          };
        })
      };

    }

  }


};
