import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/discover');

import {
  postRepository,
  userRepository,
  localityRepository,
  tagRepository,
  checkInRepository
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

const getPostContent = async (post) => {

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

}

const getLocalityDiscovery = async (locality, request) => {

  const connectionsFrom = await postRepository.getConnectionsByLocality(locality, 'arrival');
  const connectionsTo = await postRepository.getConnectionsByLocality(locality, 'departure');
  const firstCheckIn = await postRepository.getCheckIn({ locality: locality }, { order: [['createdAt', 'desc']] });
  const checkInCount = await postRepository.getCheckInCount(locality);

  const posts = await postRepository.getPostsByLocality(locality, 5);
  const fullPosts = posts.map(async post => {
    return await getPostContent(post);
  });

  return {
    groupType: 'locality',
    groupName: locality,
    checkInCount,
    feedItem: await getFeedItem(request, firstCheckIn),
    posts: fullPosts,
    connectionsFrom,
    connectionsTo
  };

};

const getTagDiscovery = async (tag, request) => {

  const checkInCount = await checkInRepository.getCheckInCountByTag(tag);
  const taggedCheckIns = await checkInRepository.getTaggedCheckIns({ tags: [tag] }, { limit: 1 });
  const posts = await postRepository.getPostsByTag(tag);
  const fullPosts = posts.map(async post => {
    return await getPostContent(post);
  });

  return {
    groupType: 'tag',
    groupName: tag,
    checkInCount,
    feedItem: taggedCheckIns.length > 0 ? await getFeedItem(request, taggedCheckIns[0]) : null,
    posts: fullPosts
  };

};

export const DiscoverQueryFields = {

  discover: {

    type: DiscoveryResultType,
    description: 'Query content by location',
    args: {
      search: { type: GraphQLString },
      type: { type: GraphQLString },
      offset: { type: GraphQLInt },
      localityOffset: { type: GraphQLInt },
      tagOffset: { type: GraphQLInt },
      limit: { type: GraphQLInt }
    },
    resolve: async ({ request }, { search, type, offset, localityOffset, tagOffset, limit }) => {

      log.info(graphLog(request, 'discover',`search=${search} type=${type} offset=${offset} limit=${limit}`));

      const offsetRatio = (offset || 0) / limit;
      const locLimit = limit - (Math.round(limit/2));
      const tagLimit = limit - locLimit;
      const newLocationOffset = localityOffset || offsetRatio * locLimit;
      const newTagOffset = tagOffset || offsetRatio * tagLimit;

      const locOptions = {};
      if (search) locOptions.search = search;
      if (offset) locOptions.offset = newLocationOffset;
      if (limit) locOptions.limit = locLimit;

      const localities = await localityRepository.getCheckInLocalities(locOptions);

      const latestCheckIns = await checkInRepository.getLatestCheckIns(limit || 10, localityOffset || 0);
      const latestTags = await tagRepository.getLatestTags(limit || 10, tagOffset || 0);
      const allDiscoveries = latestCheckIns.concat(latestTags);
      const sortedDiscoveries = allDiscoveries.sort((a, b) => a < b);
      console.log("SORTED", sortedDiscoveries);

      let calcLocalityOffset = 0;
      let calcTagOffset = 0;

      let discoveries = [];
      for (let i = 0; i < (limit || 10) && i < sortedDiscoveries.length; i++) {
        const discovery = sortedDiscoveries[i];
        if (discovery.locality) {
          calcLocalityOffset++;
          discoveries = discoveries.concat([await getLocalityDiscovery(discovery.locality, request)]);
        } else if (discovery.tag) {
          calcTagOffset++;
          discoveries = discoveries.concat([await getTagDiscovery(discovery.tag, request)]);
        }
      }

      /*
      for (let i = 0; i < localities.length; i++) {
        discoveries = discoveries.concat([await getLocalityDiscovery(localities[i], request)]);
      }

      const tagOptions = {};
      if (offset) tagOptions.offset = newTagOffset;
      if (limit) tagOptions.limit = tagLimit;

      const tags = await tagRepository.getTags(search ? { value: { $ilike: `%${search}%` } } : {}, tagOptions);
      for (let i = 0; i < tags.length; i++) {
        discoveries = discoveries.concat([await getTagDiscovery(tags[i].value, request)]);
      }
      */

      console.log("LOCATION OFFSETS", calcTagOffset, calcTagOffset);
      return {
        discoveries,
        localityOffset: (localityOffset || 0) + calcLocalityOffset,
        tagOffset: (tagOffset || 0) + calcTagOffset
      };

    }

  }

};
