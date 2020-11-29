import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/discover');

import {
  postRepository,
  userRepository,
  localityRepository,
  tagRepository,
  tripRepository,
  checkInRepository,
  terminalRepository
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
  const firstCheckIn = await checkInRepository.getCheckInWithPostsByLocality(locality);
  const checkInCount = await postRepository.getCheckInCount(locality);
  const postCount = await postRepository.getPostCountByLocality(locality);
  const tags = await tagRepository.getLatestTagsByLocality(locality, 6);
  const trips = await tripRepository.getLatestTripsByLocality(locality, 6);
  const connectionCount = await terminalRepository.getTerminalCountByLocality(locality);

  const posts = await postRepository.getPostsByLocality(locality, 5);
  const fullPosts = posts.map(async post => {
    return await getPostContent(post);
  });

  return {
    groupType: 'locality',
    groupName: locality,
    checkInCount,
    postCount,
    tags,
    trips,
    connectionCount,
    feedItem: firstCheckIn ? await getFeedItem(request, firstCheckIn) : null,
    posts: fullPosts,
    connectionsFrom,
    connectionsTo
  };

};

const getCountryDiscovery = async (country, request) => {

  const connectionsFrom = await postRepository.getConnectionsByCountry(country, 'arrival');
  const connectionsTo = await postRepository.getConnectionsByCountry(country, 'departure');
  const firstCheckIn = await checkInRepository.getCheckInWithPostsByCountry(country);
  const checkInCount = await checkInRepository.getCheckInCountByCountry(country);
  const postCount = await postRepository.getPostCountByCountry(country);
  const tags = await tagRepository.getLatestTagsByCountry(country, 6);
  const trips = await tripRepository.getLatestTripsByCountry(country, 6);
  const connectionCount = await terminalRepository.getTerminalCountByCountry(country);

  const posts = await postRepository.getPostsByCountry(country, 5);
  const fullPosts = posts.map(async post => {
    return await getPostContent(post);
  });

  return {
    groupType: 'country',
    groupName: country,
    checkInCount,
    postCount,
    tags,
    trips,
    connectionCount,
    feedItem: firstCheckIn ? await getFeedItem(request, firstCheckIn) : null,
    posts: fullPosts,
    connectionsFrom,
    connectionsTo
  };

};

const getTagDiscovery = async (tag, request) => {

  const checkInCount = await checkInRepository.getCheckInCountByTag(tag);
  const taggedCheckIns = await checkInRepository.getTaggedCheckInWithPhotos(tag);
  const posts = await postRepository.getPostsByTag(tag, 5);
  const postCount = await postRepository.getPostCountByTag(tag);
  const localities = await localityRepository.getLocalitiesByTag(tag, 14);
  const localityCount = await localityRepository.getLocalityCountByTag(tag);
  const connectionCount = await terminalRepository.getTerminalCountByTag(tag);

  const fullPosts = posts.map(async post => {
    return await getPostContent(post);
  });

  return {
    groupType: 'tag',
    groupName: tag,
    checkInCount,
    connectionCount,
    localityCount,
    localities,
    postCount,
    feedItem: taggedCheckIns.length > 0 ? await getFeedItem(request, taggedCheckIns[0]) : null,
    posts: fullPosts
  };

};

const getTripDiscovery = async (discovery, request) => {

  const checkInCount = discovery.lastCheckInId ?
    await checkInRepository.getCheckInCountByTrip(discovery.tripId) :
    await checkInRepository.getCheckInCountByOpenTrip(discovery.tripId);

  const tripCheckIns = discovery.lastCheckInId ?
    await checkInRepository.getTripCheckInsWithPhotos(discovery.tripId) :
    await checkInRepository.getOpenTripCheckInsWithPhotos(discovery.tripId);

  const posts = await postRepository.getPostsByTrip(discovery.tripId, !discovery.lastCheckInId, 5);
  const postCount = await postRepository.getPostCountByTrip(discovery.tripId, !discovery.lastCheckInId);

  const localities = await localityRepository.getLocalitiesByTrip(discovery.tripId, !discovery.lastCheckInId, 14);
  const localityCount = await localityRepository.getLocalityCountByTrip(discovery.tripId, !discovery.lastCheckInId);


  const connectionCount = terminalRepository.getTerminalCountByTrip(discovery.tripId, !discovery.lastCheckInId);

  const fullPosts = posts.map(async post => {
    return await getPostContent(post);
  });

  return {
    groupType: 'trip',
    groupName: discovery.trip,
    groupId: discovery.tripUuid,
    checkInCount,
    localityCount,
    localities,
    postCount,
    connectionCount,
    feedItem: tripCheckIns.length > 0 ? await getFeedItem(request, tripCheckIns[0]) : null,
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
      countryOffset: { type: GraphQLInt },
      tagOffset: { type: GraphQLInt },
      tripOffset: { type: GraphQLInt },
      userOffset: { type: GraphQLInt },
      limit: { type: GraphQLInt }
    },
    resolve: async ({ request }, { search, type, offset, localityOffset, countryOffset, tagOffset, tripOffset, userOffset, limit }) => {

      log.info(graphLog(request, 'discover',`search=${search} type=${type} offset=${offset} limit=${limit}`));

      const latestCountries = await checkInRepository.getLatestCountries(limit || 10, countryOffset || 0, search);
      const latestCheckIns = await checkInRepository.getLatestCheckIns(limit || 10, localityOffset || 0, search);
      const latestTags = await tagRepository.getLatestTags(limit || 10, tagOffset || 0, search);
      const latestTrips = await tripRepository.getLatestTrips(limit || 10, tripOffset || 0, search);
      const matchingUsers = search && search.length > 0 ? await userRepository.getUsersBySearchTerm(limit || 10, userOffset || 0, search) : [];

      const allDiscoveries = latestCountries.concat(latestCheckIns).concat(latestTags).concat(latestTrips);
      const sortedDiscoveries = allDiscoveries.sort((a, b) => {
        return (new Date(b.lastCreated)).getTime() - (new Date(a.lastCreated)).getTime();
      });

      let calcLocalityOffset = 0;
      let calcCountryOffset = 0;
      let calcTagOffset = 0;
      let calcTripOffset = 0;
      let discoveries = [];
      for (let i = 0; i < (limit || 10) && i < sortedDiscoveries.length; i++) {
        const discovery = sortedDiscoveries[i];
        if (discovery.country) {
          calcCountryOffset++;
          discoveries = discoveries.concat([await getCountryDiscovery(discovery.country, request)]);
        } else if (discovery.locality) {
          calcLocalityOffset++;
          discoveries = discoveries.concat([await getLocalityDiscovery(discovery.locality, request)]);
        } else if (discovery.tag) {
          calcTagOffset++;
          discoveries = discoveries.concat([await getTagDiscovery(discovery.tag, request)]);
        } else if (discovery.trip) {
          calcTripOffset++;
          discoveries = discoveries.concat([await getTripDiscovery(discovery, request)]);
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
      const newCountryOffset = (countryOffset || 0) + calcCountryOffset;
      const newTagOffset = (tagOffset || 0) + calcTagOffset;
      const newTripOffset = (tripOffset || 0) + calcTripOffset;
      const newUserOffset = (userOffset || 0) + calcUserOffset;

      return {
        discoveries,
        localityOffset: newLocalityOffset,
        countryOffset: newCountryOffset,
        tagOffset: newTagOffset,
        tripOffset: newTripOffset,
        userOffset: newUserOffset
      };

    }

  }

};
