import fs from 'fs';
import path from 'path';
import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/discover');

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
  TerminalType,
  TerminalInputType,
  CheckInType,
  CheckInInputType,
  MediaItemType,
  MediaItemInputType,
  FeedItemType,
  FeedType
} from '../types/PostType';

import {
  DiscoveryResultType,
  DiscoveryItemType
} from '../types/DiscoverType';

import {
  GraphQLString
} from 'graphql';


import { STORAGE_PATH, MEDIA_PATH, MEDIA_URL, APP_URL } from '../../config';

export const DiscoverMutationFields = {
};

export const DiscoverQueryFields = {

  discover: {

    type: DiscoveryResultType,
    description: 'Query content by location',
    args: {
      search: { type: GraphQLString },
      type: { type: GraphQLString }
    },
    resolve: async ({ request }, { search, type }) => {

      log.info(graphLog(request, 'discover',`search=${search} type=${type}`));
      return {
        discoveries: []
      };

    }

  }

};
