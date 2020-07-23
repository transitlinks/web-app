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
  const firstCheckIn = await postRepository.getCheckIn({ locality }, { order: [['createdAt', 'desc']] });
  const checkInCount = await postRepository.getCheckInCount(locality);
  const postCount = await postRepository.getPostCount(locality);

  const posts = await postRepository.getPostsByLocality(locality, 5);
  const fullPosts = posts.map(async post => {
    return await getPostContent(post);
  });

  return {
    groupType: 'locality',
    groupName: locality,
    checkInCount,
    postCount,
    feedItem: await getFeedItem(request, firstCheckIn),
    posts: fullPosts,
    connectionsFrom,
    connectionsTo
  };

};

const getTagDiscovery = async (tag, request) => {

  const checkInCount = await checkInRepository.getCheckInCountByTag(tag);
  const taggedCheckIns = await checkInRepository.getTaggedCheckIns({ tags: [tag] }, { limit: 1 });
  const posts = await postRepository.getPostsByTag(tag, 5);
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

const getUserDiscovery = async (user, request) => {

  const checkInCount = await checkInRepository.getCheckInCountByUser(user.id);
  const posts = await postRepository.getPosts({ userId: user.id }, { limit: 5 });
  const lastCheckIn = await checkInRepository.getCheckIn({ userId: user.id });
  const fullPosts = posts.map(async post => {
    return await getPostContent(post);
  });

  return {
    groupType: 'user',
    groupName: user.username || user.firstName + ' ' + user.lastName,
    checkInCount,
    feedItem: lastCheckIn ? await getFeedItem(request, lastCheckIn) : null,
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
      userOffset: { type: GraphQLInt },
      limit: { type: GraphQLInt }
    },
    resolve: async ({ request }, { search, type, offset, localityOffset, tagOffset, userOffset, limit }) => {

      log.info(graphLog(request, 'discover',`search=${search} type=${type} offset=${offset} limit=${limit}`));

      const latestCheckIns = await checkInRepository.getLatestCheckIns(limit || 10, localityOffset || 0, search);
      const latestTags = await tagRepository.getLatestTags(limit || 10, tagOffset || 0, search);
      const matchingUsers = search && search.length > 0 ? await userRepository.getUsersBySearchTerm(limit || 10, userOffset || 0, search) : [];

      const allDiscoveries = latestCheckIns.concat(latestTags);
      const sortedDiscoveries = allDiscoveries.sort((a, b) => {
        return (new Date(b.lastCreated)).getTime() - (new Date(a.lastCreated)).getTime();
      });

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

      let numUsers = matchingUsers.length;
      if (discoveries.length < limit - 2) {
        numUsers = limit - discoveries.length;
      } else {
        numUsers = 2;
      }


      const userDiscoveries = matchingUsers.slice(0, numUsers)
        .map(async user => await getUserDiscovery(user, request));

      const calcUserOffset = userDiscoveries.length;

      discoveries = userDiscoveries.concat(discoveries);

      const newLocalityOffset = (localityOffset || 0) + calcLocalityOffset;
      const newTagOffset = (tagOffset || 0) + calcTagOffset;
      const newUserOffset = (userOffset || 0) + calcUserOffset;

      return {
        discoveries,
        localityOffset: newLocalityOffset,
        tagOffset: newTagOffset,
        userOffset: newUserOffset
      };

    }

  }

};
