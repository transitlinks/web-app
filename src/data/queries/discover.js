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

import { getFeedItem } from './posts';

import {
  DiscoveryResultType,
  DiscoveryItemType
} from '../types/DiscoverType';

import {
  GraphQLInt,
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
      type: { type: GraphQLString },
      offset: { type: GraphQLInt },
      limit: { type: GraphQLInt }
    },
    resolve: async ({ request }, { search, type, offset, limit }) => {

      log.info(graphLog(request, 'discover',`search=${search} type=${type} offset=${offset} limit=${limit}`));

      const options = {};
      if (offset) options.offset = offset;
      if (limit) options.limit = limit;

      const localities = await postRepository.getCheckInLocalities(options);
      console.log("locs", localities);

      let discoveries = [];
      for (let i = 0; i < localities.length; i++) {

        const connectionsFrom = await postRepository.getConnectionsByLocality(localities[i], 'arrival');
        const connectionsTo = await postRepository.getConnectionsByLocality(localities[i], 'departure');
        console.log(localities[i], '->', connectionsTo);
        console.log(localities[i], '<-', connectionsFrom);
        const firstCheckIn = await postRepository.getCheckIn({ locality: localities[i] });
        const checkInCount = await postRepository.getCheckInCount(localities[i]);

        const posts = await postRepository.getPostsByLocality(localities[i]);
        const locPosts = posts.map(async post => {
          const checkIn = await postRepository.getCheckIn({ id: post.checkInId });
          const mediaItems = await postRepository.getMediaItems({ entityUuid: post.uuid });
          let userName = null;
          if (post.userId) {
            const user = await userRepository.getById(post.userId);
            userName = user.firstName + ' ' + user.lastName;
          }
          return {
            ...post.json(),
            user: userName,
            checkIn: checkIn.json(),
            mediaItems: mediaItems.map(mediaItem => mediaItem.json())
          };
        });

        discoveries = discoveries.concat([
          {
            groupType: 'locality',
            groupName: localities[i],
            checkInCount,
            feedItem: await getFeedItem(request, firstCheckIn),
            posts: locPosts,
            connectionsFrom,
            connectionsTo
          }
        ]);
      }

      return {
        discoveries
      };

    }

  }

};
