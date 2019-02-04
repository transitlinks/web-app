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
  CheckInInputType
} from '../types/PostType';

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

import { STORAGE_PATH, MEDIA_PATH, MEDIA_URL, APP_URL } from '../../config';

export const PostMutationFields = {

  post: {

    type: PostType,
    description: 'Create or update a post',
    args: {
      post: { type: PostInputType }
    },
    resolve: async ({ request }, { post }) => {
      log.info(`graphql-request=create-or-update-post user=${request.user ? request.user.uuid : null}`);
      return await postRepository.savePost({ ...post, userId: request.user ? request.user.id : null });
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
      return await postRepository.saveCheckIn({ ...checkIn, userId: request.user ? request.user.id : null });
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
      const post = await postRepository.getPostByUuid(uuid);
      if (!post) {
        throw new Error(`Post (uuid ${uuid}) not found`);
      }

      return post;

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
      return { posts };

    }

  },

  checkIns: {

    type: CheckInsType,
    description: 'Find check-ins',
    args: {
      input: { type: GraphQLString }
    },
    resolve: async ({ request }, { input }) => {

      log.info(`graphql-request=find-check-ins user=${request.user ? request.user.uuid : null}`);
      const checkIns = await postRepository.getFeedCheckIns(request.user ? request.user.id : null);
      return { checkIns };

    }

  }


};
