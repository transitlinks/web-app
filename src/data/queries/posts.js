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
	PostInputType
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

  }

};

export const PostQueryFields = {

  post: {

    type: PostType,
    description: 'Find a post by id',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {

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
      const posts = await postRepository.getFeedPosts(request.user ? request.user.id : null);
      console.log("returning posts", posts);
      return { posts };
    }

  }


};
