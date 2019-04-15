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

      const localities = await postRepository.getCheckInLocalities();
      //const checkIns = await postRepository.getCheckIns({});;
      console.log("locs", localities);

      let discoveries = [];;
      for (let i = 0; i < localities.length; i++) {
        const checkInsByLoc = await postRepository.getCheckIns({ locality: localities[i] });
        let locPosts = [];
        let locDepartures = [];
        let locArrivals = [];
        for (let j = 0; j < checkInsByLoc.length; j++) {
          const posts = await postRepository.getPosts({ checkInId: checkInsByLoc[j].id });
          const departures = await postRepository.getTerminals({ checkInId: checkInsByLoc[j].id, type: 'departure' });
          const arrivals = await postRepository.getTerminals({ checkInId: checkInsByLoc[j].id, type: 'arrival' });
          locPosts = locPosts.concat(posts.map(post => {
            const json = post.json();
            json.checkIn = checkInsByLoc[j].json()
            return json;
          }));
          locDepartures = locDepartures.concat(departures.map(departure => {
            const json = departure.json();
            json.checkIn = checkInsByLoc[j].json()
            return json;
          }));
          locArrivals = locArrivals.concat(arrivals.map(arrival => {
            const json = arrival.json();
            json.checkIn = checkInsByLoc[j].json()
            return json;
          }));
        }
        discoveries = discoveries.concat([
          {
            groupType: 'locality',
            groupName: localities[i],
            posts: locPosts,
            departures: locDepartures,
            arrivals: locArrivals
          }
        ]);
      }

      return {
        discoveries
      };

    }

  }

};
