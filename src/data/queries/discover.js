import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/discover');

import {
  postRepository,
  userRepository,
  localityRepository
} from '../source';


import { getFeedItem } from './posts';

import {
  DiscoveryResultType
} from '../types/DiscoverType';

import {
  GraphQLInt,
  GraphQLString
} from 'graphql';

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
      if (search) options.search = search;
      if (offset) options.offset = offset;
      if (limit) options.limit = limit;

      const localities = await localityRepository.getCheckInLocalities(options);

      let discoveries = [];
      for (let i = 0; i < localities.length; i++) {

        const connectionsFrom = await postRepository.getConnectionsByLocality(localities[i], 'arrival');
        const connectionsTo = await postRepository.getConnectionsByLocality(localities[i], 'departure');
        console.log(localities[i], '->', connectionsTo);
        console.log(localities[i], '<-', connectionsFrom);
        const firstCheckIn = await postRepository.getCheckIn({ locality: localities[i] }, { order: [['createdAt', 'desc']] });
        const checkInCount = await postRepository.getCheckInCount(localities[i]);

        const posts = await postRepository.getPostsByLocality(localities[i]);
        const locPosts = posts.map(async post => {
          const checkIn = await postRepository.getCheckIn({ id: post.checkInId });
          const mediaItems = await postRepository.getMediaItems({ entityUuid: post.uuid }, { order: [['createdAt', 'desc']] });
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
