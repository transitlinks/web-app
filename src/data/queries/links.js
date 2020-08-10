import fs from 'fs';
import path from 'path';
import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/links');

import { uploadVideo } from '../../services/youtubeDataApi';

import {
  localityRepository,
  linkRepository,
  checkInRepository,
  terminalRepository,
  userRepository
} from '../source';

import {
  MediaItemType, LinkSearchResultType,
} from '../types/TransitLinkType';

import {
  GraphQLString,
  GraphQLList,
} from 'graphql';

import { STORAGE_PATH, MEDIA_PATH } from '../../config';
import tagRepository from '../source/tagRepository';


export const TransitLinkMutationFields = {

  instanceFiles: {

    type: MediaItemType,
    description: 'Upload media files for link instance',
    args: {
      linkInstanceUuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { linkInstanceUuid }) => {

      log.info(`graphql-request=upload-instance-file user=${request.user ? request.user.uuid : null}`);

      const { file } = request;

      const nameParts = file.originalname.split('.');
      const extension = nameParts[nameParts.length - 1];
      const savePath = STORAGE_PATH || path.join(__dirname, 'public');
      const filePath = path.join(savePath, file.filename);

      const mediaPath = path.join((MEDIA_PATH || path.join(__dirname, 'public')), 'instance-media');
      const instancePath = path.join(mediaPath, linkInstanceUuid);

      if (fs.existsSync(filePath)) {

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath);
        }
        if (!fs.existsSync(instancePath)) {
          fs.mkdirSync(instancePath);
        }

        const now = (new Date()).getTime();
        const instanceFileName = `${now}.${extension}`;
        const instanceFilePath = path.join(instancePath, instanceFileName);
        fs.renameSync(filePath, instanceFilePath);

        const linkInstanceId = await linkRepository.getInstanceIdByUuid(linkInstanceUuid);
        let mediaItem = null;

        if (file.mimetype.indexOf('image') !== -1) {

          log.info(`graphql-request=upload-instance-file user=${request.user ? request.user.uuid : null} image-file-name=${instanceFileName}`);

          mediaItem = await linkRepository.saveInstanceMedia(linkInstanceId, {
            type: 'image',
            flag: false,
            url: `/instance-media/${linkInstanceUuid}/${instanceFileName}`
          });

        } else {

          const upload = await uploadVideo(linkInstanceUuid, instanceFilePath);
          const thumbnail = upload.snippet.thumbnails.medium.url;
          log.info(`graphql-request=upload-instance-file user=${request.user ? request.user.uuid : null} video-id=${upload.id}`);

          mediaItem = await linkRepository.saveInstanceMedia(linkInstanceId, {
            type: 'video',
            flag: false,
            url: upload.id,
            thumbnail
          });

        }

        return mediaItem;

      } else {
        throw new Error(`Did not find media file ${filePath})`);
      }


    }

  }

};

const findRoutePoints = async (terminals) => {
  for (let i = 0; i < terminals.length; i++) {
    const terminal = terminals[i];
    const { linkedTerminal } = terminal;
    if (linkedTerminal) {
      const linkedCheckIn = await checkInRepository.getCheckIn({ id: linkedTerminal.checkInId });
      const routeCheckIns = await checkInRepository.getCheckIns({
        createdAt: {
          $gt: terminal.type === 'departure' ? terminal.checkIn.createdAt : linkedCheckIn.createdAt,
          $lt: terminal.type === 'departure' ? linkedCheckIn.createdAt : terminal.checkIn.createdAt
        },
        userId: terminal.userId
      }, {
        order: [['createdAt', terminal.type === 'departure' ? 'ASC' : 'DESC']]
      });
      terminal.route = (routeCheckIns || {}).map(checkIn => ({ lat: checkIn.latitude, lng: checkIn.longitude }));
    }
  }
};

const findTags = async (terminals) => {
  const allTags = [];
  for (let i = 0; i < terminals.length; i++) {
    const terminal = terminals[i];
    const { linkedTerminal } = terminal;
    const checkInIds = [terminal.checkInId];
    if (linkedTerminal) checkInIds.push(linkedTerminal.checkInId);
    const tags = await tagRepository.getTagsByCheckInIds(checkInIds);
    allTags.push(...tags);
    terminal.tags = tags;
  }
  return allTags;
};

export const TransitLinkQueryFields = {

  transitLinks: {

    type: LinkSearchResultType,
    description: 'Search terminals',
    args: {
      locality: { type: GraphQLString },
      linkedLocality: { type: GraphQLString },
      tag: { type: GraphQLString },
      search: { type: GraphQLString },
      user: { type: GraphQLString },
      type: { type: GraphQLString },
      transportTypes: { type: new GraphQLList(GraphQLString) }
    },
    resolve: async ({ request }, params) => {

      const { locality, linkedLocality, tag, user, type, search, transportTypes } = params;

      log.info(graphLog(request, 'search-links',`search=${search} locality=${locality} tag=${tag} type=${type}`));

      const linkStats = [];

      if (!tag) {

        const localityQuery = { limit: 16 };
        const transportQuery = {};

        if (locality) localityQuery.locality = locality;
        if (search) localityQuery.search = search;
        if (transportTypes && transportTypes.length > 0) {
          localityQuery.transportTypes = transportTypes;
          transportQuery.transport = transportTypes;
        }
        const localities = await localityRepository.getMostTravelledLocalities(localityQuery);
        if (!linkedLocality) {

          const localities = await localityRepository.getMostTravelledLocalities(localityQuery);
          const baseQuery = {
            ...((transportTypes && transportTypes.length > 0) && { transport: transportTypes })
          };

          const getLinkedLocalityInfo = async (locality, linkedLocality, type) => {

            const terminal = await terminalRepository.getTerminal({
              locality,
              linkedLocality,
              type,
              linkedTerminalId: { $ne: null }
            });

            const counts = await terminalRepository.countInterTerminals({
              locality, linkedLocality
            });

            const formattedTerminal = terminal.json();
            delete formattedTerminal.formattedAddress;
            delete formattedTerminal.linkedFormattedAddress;
            formattedTerminal.linkCount = counts[type];
            formattedTerminal.reverseLinkCount = counts[type === 'arrival' ? 'departure' : 'arrival'];

            return {
              terminal: formattedTerminal,
              linkedLocality,
              linkCount: counts[type]
            };

          };

          for (let i = 0; i < localities.length; i++) {

            const locality = localities[i];
            const interTerminalCounts = await terminalRepository.countInterTerminals({
              ...baseQuery, locality
            });

            const departureLinks = [];
            const linkedDepartureLocalities = await terminalRepository.getLinkedLocalitiesByLocality({
              ...baseQuery, locality,
              type: 'departure'
            });
            for (let i = 0; i < linkedDepartureLocalities.length; i++) {
              departureLinks.push(await getLinkedLocalityInfo(locality, linkedDepartureLocalities[i], 'departure'));
            }

            const arrivalLinks = [];
            const linkedArrivalLocalities = await terminalRepository.getLinkedLocalitiesByLocality({
              ...baseQuery, locality,
              type: 'arrival'
            });
            for (let i = 0; i < linkedArrivalLocalities.length; i++) {
              arrivalLinks.push(await getLinkedLocalityInfo(locality, linkedArrivalLocalities[i], 'arrival'));
            }

            const terminal = await terminalRepository.getTerminal({ locality });

            const departures = departureLinks.map(dep => dep.terminal);
            const arrivals = arrivalLinks.map(arr => arr.terminal);


            const internal = await terminalRepository.getInternalDeparturesByLocality(locality, baseQuery);

            const tags = await tagRepository.getLatestTagsByLocality(locality, 14);

            linkStats.push({
              locality,
              latitude: terminal.latitude,
              longitude: terminal.longitude,
              departureCount: interTerminalCounts.arrival || 0,
              arrivalCount: interTerminalCounts.departure || 0,
              departures,
              arrivals,
              internal,
              linkedDepartures: departures.map(dep => ({ linkedLocality: dep.linkedTerminal.locality })),
              linkedArrivals: arrivals.map(arr => ({ linkedLocality: arr.linkedTerminal.locality })),
              tags
            });

          }

          return {
            searchResultType: 'connections',
            links: linkStats
          };

        } else {

          const baseQuery = {
            ...((transportTypes && transportTypes.length > 0) && { transport: transportTypes }),
            linkedLocality
          };

          console.log('BASE QUERY', baseQuery);

          const locality = localities[0];
          const interTerminals = await terminalRepository.getInterTerminalsByLocality(locality, baseQuery);
          const departures = interTerminals.filter(terminal => terminal.type === 'departure');
          const arrivals = interTerminals.filter(terminal => terminal.type === 'arrival');
          await findRoutePoints(departures);
          await findRoutePoints(arrivals);
          let allTags = await findTags(departures);
          allTags = allTags.concat(await findTags(arrivals));

          let terminal = null;
          if (departures.length > 0) terminal = departures[0];
          if (arrivals.length > 0) terminal = arrivals[0];
          if (terminal) {
            linkStats.push({
              locality,
              latitude: terminal.latitude,
              longitude: terminal.longitude,
              departures,
              arrivals,
              tags: allTags
            });
          }
        }

        return {
          searchResultType: 'links',
          locality,
          linkedLocality,
          links: linkStats
        };

      } else {

        const taggedCheckIns = await checkInRepository.getTaggedCheckIns(tag);

        if (taggedCheckIns.length > 0) {

          const query = {
            checkInId: taggedCheckIns.map(checkIn => checkIn.id),
            type: 'departure'
          };

          if (user) {
            const userId = await userRepository.getUserIdByUuid(user);
            query.userId = userId;
          }

          const departures = (await terminalRepository.getTerminals(query)).map(departure => departure.json());
          await findRoutePoints(departures);
          let terminal = null;
          if (departures.length > 0) terminal = departures[0];
          if (terminal) {
            linkStats.push({
              locality: terminal.locality,
              latitude: terminal.latitude,
              longitude: terminal.longitude,
              departures,
              arrivals: [],
              internal: []
            });
          }
        }

        return {
          searchResultType: 'tagged',
          links: linkStats
        };

      }

    }

  },

  linkInstanceMedia: {

    type: new GraphQLList(MediaItemType),
    description: 'Get media associated to a link instance',
    args: {
      linkInstanceUuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { linkInstanceUuid }) => {
      const linkInstanceId = await linkRepository.getInstanceIdByUuid(linkInstanceUuid);
      const mediaItems = await linkRepository.getMediaItems({ linkInstanceId });
      return mediaItems;

    }

  }

};
