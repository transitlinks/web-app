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

      const offsetRatio = offset / limit;
      const locLimit = limit - (Math.round(limit/2));
      const tagLimit = limit - locLimit;

      const locOptions = {};
      if (search) locOptions.search = search;
      if (offset) locOptions.offset = offsetRatio * locLimit;
      if (limit) locOptions.limit = locLimit;

      const localities = await localityRepository.getCheckInLocalities(locOptions);

      let discoveries = [];
      for (let i = 0; i < localities.length; i++) {

        const connectionsFrom = await postRepository.getConnectionsByLocality(localities[i], 'arrival');
        const connectionsTo = await postRepository.getConnectionsByLocality(localities[i], 'departure');
        console.log(localities[i], '->', connectionsTo);
        console.log(localities[i], '<-', connectionsFrom);
        const firstCheckIn = await postRepository.getCheckIn({ locality: localities[i] }, { order: [['createdAt', 'desc']] });
        const checkInCount = await postRepository.getCheckInCount(localities[i]);

        const posts = await postRepository.getPostsByLocality(localities[i], 5);
        const fullPosts = posts.map(async post => {
          return await getPostContent(post);
        });

        discoveries = discoveries.concat([
          {
            groupType: 'locality',
            groupName: localities[i],
            checkInCount,
            feedItem: await getFeedItem(request, firstCheckIn),
            posts: fullPosts,
            connectionsFrom,
            connectionsTo
          }
        ]);
      }

      const tagOptions = {};
      if (offset) tagOptions.offset = offsetRatio * tagLimit;
      if (limit) tagOptions.limit = tagLimit;

      const tags = await tagRepository.getTags(search ? { value: { $ilike: `%${search}%` } } : {}, tagOptions);
      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i].value;
        const checkInCount = await checkInRepository.getCheckInCountByTag(tag);
        const taggedCheckIns = await checkInRepository.getTaggedCheckIns({ tags: [tag] }, { limit: 1 });
        const posts = await postRepository.getPostsByTag(tag);
        const fullPosts = posts.map(async post => {
          return await getPostContent(post);
        });
        discoveries = discoveries.concat([
          {
            groupType: 'tag',
            groupName: tag,
            checkInCount,
            feedItem: taggedCheckIns.length > 0 ? await getFeedItem(request, taggedCheckIns[0]) : null,
            posts: fullPosts
          }
        ]);
      }

      return {
        discoveries
      };

    }

  }

};
