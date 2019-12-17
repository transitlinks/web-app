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

      let discoveries = [];
      for (let i = 0; i < localities.length; i++) {

        const checkInsByLoc = []; //await postRepository.getCheckIns({ locality: localities[i] });
        //console.log("CHECKINS BY LOC", checkInsByLoc[0].id);

        const connectionsFrom = await postRepository.getConnectionsByLocality(localities[i], 'arrival');
        const connectionsTo = await postRepository.getConnectionsByLocality(localities[i], 'departure');
        console.log(localities[i], '->', connectionsTo);
        console.log(localities[i], '<-', connectionsFrom);
        const firstCheckIn = await postRepository.getCheckIn({ locality: localities[i] });

        let locPosts = [];

        for (let j = 0; j < checkInsByLoc.length; j++) {
          const posts = await postRepository.getPosts({ checkInId: checkInsByLoc[j].id });
          //const departures = await postRepository.getTerminals({ checkInId: checkInsByLoc[j].id, type: 'departure' });
          //const arrivals = await postRepository.getTerminals({ checkInId: checkInsByLoc[j].id, type: 'arrival' });
          locPosts = locPosts.concat(posts.map(async post => {
            const mediaItems = await postRepository.getMediaItems({ entityUuid: post.uuid });
            let userName = null;
            if (post.userId) {
              const user = await userRepository.getById(post.userId);
              userName = user.firstName + ' ' + user.lastName;
            }
            return {
              ...post.json(),
              user: userName,
              checkIn: checkInsByLoc[j],
              mediaItems: mediaItems.map(mediaItem => mediaItem.json())
            };
          }));

          /*
          locDepartures = locDepartures.concat(departures.map(async terminal => {

            let linkedTerminal = null;

            if (terminal.linkedTerminalId) {
              linkedTerminal = await postRepository.getTerminal({ id: terminal.linkedTerminalId });
              const linkedTerminalCheckIn = await postRepository.getCheckIn({ id: linkedTerminal.checkInId });
              linkedTerminal = linkedTerminal.json();
              linkedTerminal.checkIn = linkedTerminalCheckIn.json();
            }

            return {
              ...terminal.json(),
              checkIn: checkInsByLoc[j].json(),
              linkedTerminal
            };

          }));

          locArrivals = locArrivals.concat(arrivals.map(async terminal => {

            let linkedTerminal = null;

            if (terminal.linkedTerminalId) {
              linkedTerminal = await postRepository.getTerminal({ id: terminal.linkedTerminalId });
              const linkedTerminalCheckIn = await postRepository.getCheckIn({ id: linkedTerminal.checkInId });
              linkedTerminal = linkedTerminal.json();
              linkedTerminal.checkIn = linkedTerminalCheckIn.json();
            }

            return {
              ...terminal.json(),
              checkIn: checkInsByLoc[j].json(),
              linkedTerminal
            };

          }));
           */

        }

        discoveries = discoveries.concat([
          {
            groupType: 'locality',
            groupName: localities[i],
            checkInCount: 9, //checkInsByLoc.length,
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
