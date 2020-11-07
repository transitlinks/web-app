import fs from 'fs';
import path from 'path';
import geoTz from 'geo-tz';
import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/links');

import { uploadVideo } from '../../services/youtubeDataApi';

import {
  localityRepository,
  linkRepository,
  checkInRepository,
  terminalRepository,
  userRepository, tripRepository,
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
import { getLocalDateTime } from '../../core/utils';


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

export const findRoutePoints = async (terminals) => {

  for (let i = 0; i < terminals.length; i++) {
    const terminal = terminals[i];
    const { linkedTerminal } = terminal;
    if (linkedTerminal) {
      const routeCheckIns = await checkInRepository.getCheckIns({
        createdAt: {
          $gt: terminal.type === 'departure' ? terminal.createdAt : linkedTerminal.createdAt,
          $lt: terminal.type === 'departure' ? linkedTerminal.createdAt : terminal.createdAt
        },
        id: { $notIn: [terminal.checkInId, linkedTerminal.checkInId] },
        userId: terminal.userId
      }, {
        order: [['createdAt', terminal.type === 'departure' ? 'ASC' : 'DESC']]
      });
      const routeCoords = await tripRepository.getTripCoords({
        createdAt: {
          $gt: terminal.type === 'departure' ? terminal.createdAt : linkedTerminal.createdAt,
          $lt: terminal.type === 'departure' ? linkedTerminal.createdAt : terminal.createdAt
        },
        userId: terminal.userId
      }, {
        order: [['createdAt', terminal.type === 'departure' ? 'ASC' : 'DESC']]
      });
      terminal.routeCheckIns = routeCheckIns || [];
      terminal.route = (routeCheckIns || []).concat(routeCoords || []).sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return terminal.type === 'departure' ? aTime - bTime : bTime - aTime;
      }).map(loc => ({ lat: loc.latitude, lng: loc.longitude }));
    }
  }
};

const findTags = async (terminals) => {
  const allTags = [];
  for (let i = 0; i < terminals.length; i++) {
    const terminal = terminals[i];
    const tags = await tagRepository.getTagsByCheckInIds([terminal.checkInId]);
    const { linkedTerminal } = terminal;
    if (linkedTerminal) {
      const linkedTags = await tagRepository.getTagsByCheckInIds([linkedTerminal.checkInId]);
      tags.push(
        ...linkedTags.filter(
          linkedTag => !tags.find(
            tag => tag.tag === linkedTag.tag && tag.userUuid === linkedTag.userUuid
          )
        )
      );
    }

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
      from: { type: GraphQLString },
      to: { type: GraphQLString },
      tag: { type: GraphQLString },
      trip: { type: GraphQLString },
      search: { type: GraphQLString },
      user: { type: GraphQLString },
      type: { type: GraphQLString },
      transportTypes: { type: new GraphQLList(GraphQLString) }
    },
    resolve: async ({ request }, params) => {

      const { locality, linkedLocality, from, to, tag, trip, user, type, search, transportTypes } = params;

      log.info(graphLog(request, 'search-links',`search=${search} locality=${locality} tag=${tag} type=${type}`));

      const linkStats = [];

      if (tag || trip) {

        let filteredCheckIns = [];
        let filteredUser = null;
        let tripName = null;

        if (tag) {
          filteredCheckIns = await checkInRepository.getTaggedCheckIns(tag);
          if (user) {
            filteredUser = await userRepository.getByUuid(user);
          }
        } else if (trip) {
          const tripEntity = await tripRepository.getTrip({ uuid: trip });
          if (tripEntity) {
            if (tripEntity.lastCheckInId) {
              filteredCheckIns = await checkInRepository.getTripCheckIns(tripEntity.id);
            } else {
              filteredCheckIns = await checkInRepository.getOpenTripCheckIns(tripEntity.id);
            }
            filteredUser = await userRepository.getById(tripEntity.userId);
            tripName = tripEntity.name;
          }
        }


        if (filteredCheckIns.length > 0) {

          const query = {
            checkInId: filteredCheckIns.map(checkIn => checkIn.id),
            type: 'departure'
          };

          if (filteredUser) {
            query.userId = filteredUser.id;
          }

          const departures = (await terminalRepository.getTerminals(query, { order: [['createdAt', 'ASC']] }))
            .filter(dep => dep.linkedTerminal)
            .map(dep => ({
              ...dep.json(),
              localDateTime: getLocalDateTime(dep.createdAt, geoTz(dep.latitude, dep.longitude)[0]),
              utcDateTime: dep.createdAt,
              linkedTerminal: {
                ...dep.linkedTerminal.json(),
                localDateTime: getLocalDateTime(dep.linkedTerminal.createdAt, geoTz(dep.linkedTerminal.latitude, dep.linkedTerminal.longitude)[0]),
                utcDateTime: dep.linkedTerminal.createdAt,
              }
            }));

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
          searchResultType: tag ? 'tagged' : 'trip',
          links: linkStats,
          user: filteredUser ? `${filteredUser.firstName} ${filteredUser.lastName}` : null,
          userImage: filteredUser ? filteredUser.photo : null,
          tripName
        };

      }

      if (from && to) {

        const routeSearchParams = {};
        if (transportTypes && transportTypes.length > 0) {
          routeSearchParams.transportTypes = transportTypes;
        }

        const routes = await terminalRepository.getRoute(from, to, routeSearchParams);
        const routeKeys = Object.keys(routes);

        if (routeKeys.length > 0) {

          let terminals = [];

          for (let i = 0; i < routeKeys.length; i++) {

            const departures = routes[routeKeys[i]]
              .filter(dep => dep.linkedTerminalId)
              .map(dep => ({
                ...dep,
                routeId: parseInt(routeKeys[i]),
                routeIndex: dep.path_seq,
                localDateTime: getLocalDateTime(dep.createdAt, geoTz(dep.latitude, dep.longitude)[0]),
                utcDateTime: dep.createdAt,
                linkedTerminal: {
                  ...dep.linkedTerminal.json(),
                  localDateTime: getLocalDateTime(dep.linkedTerminal.createdAt, geoTz(dep.linkedTerminal.latitude, dep.linkedTerminal.longitude)[0]),
                  utcDateTime: dep.linkedTerminal.createdAt,
                }
              }));

            await findRoutePoints(departures);

            terminals = terminals.concat(departures);

          }

          let terminal = null;
          if (terminals.length > 0) terminal = terminals[0];

          if (terminal) {
            linkStats.push({
              locality: terminal.locality,
              latitude: terminal.latitude,
              longitude: terminal.longitude,
              from,
              to,
              departures: terminals,
              arrivals: [],
              internal: []
            });

          }
        }

        return {
          searchResultType: 'route',
          from,
          to,
          links: linkStats
        };

      }

      const localityQuery = { limit: 16 };
      const transportQuery = {};

      if (locality) localityQuery.locality = locality;
      if (search) localityQuery.search = search;
      if (transportTypes && transportTypes.length > 0) {
        localityQuery.transportTypes = transportTypes;
        transportQuery.transport = transportTypes;
      }

      const localities = await localityRepository.getMostTravelledLocalities(localityQuery);
      const singleLocality = localities.length === 1 ? localities[0] : null;

      if (!linkedLocality) {

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

          if (!terminal) return null;

          const counts = await terminalRepository.countInterTerminals({
            locality, linkedLocality
          });

          const timeZone = geoTz(terminal.latitude, terminal.longitude)[0];
          const formattedTerminal = {
            ...terminal.json(),
            localDateTime: getLocalDateTime(terminal.createdAt, timeZone),
            utcDateTime: terminal.createdAt,
          };
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

          const terminalLocality = localities[i];
          const interTerminalCounts = await terminalRepository.countInterTerminals({
            ...baseQuery, locality: terminalLocality
          });

          const departureLinks = [];
          const linkedDepartureLocalities = await terminalRepository.getLinkedLocalitiesByLocality({
            ...baseQuery, locality: terminalLocality,
            type: 'departure'
          });
          for (let i = 0; i < linkedDepartureLocalities.length; i++) {
            departureLinks.push(await getLinkedLocalityInfo(terminalLocality, linkedDepartureLocalities[i], 'departure'));
          }

          const arrivalLinks = [];
          const linkedArrivalLocalities = await terminalRepository.getLinkedLocalitiesByLocality({
            ...baseQuery, locality: terminalLocality,
            type: 'arrival'
          });
          for (let i = 0; i < linkedArrivalLocalities.length; i++) {
            arrivalLinks.push(await getLinkedLocalityInfo(terminalLocality, linkedArrivalLocalities[i], 'arrival'));
          }

          const terminal = await terminalRepository.getTerminal({ locality: terminalLocality });

          const departures = departureLinks.filter(dep => dep).map(dep => dep.terminal);
          const arrivals = arrivalLinks.filter(arr => arr).map(arr => arr.terminal);

          const internal = await terminalRepository.getInternalDeparturesByLocality(terminalLocality, baseQuery);

          const tags = await tagRepository.getLatestTagsByLocality(terminalLocality, 14);

          linkStats.push({
            locality: terminalLocality,
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
          links: linkStats,
          locality: singleLocality || locality
        };

      }
      const baseQuery = {
        ...((transportTypes && transportTypes.length > 0) && { transport: transportTypes }),
        linkedLocality
      };

      const matchingLocality = localities[0];
      const interTerminals = await terminalRepository.getInterTerminalsByLocality(matchingLocality, baseQuery);
      const departures = interTerminals.filter(terminal => terminal.type === 'departure');
      const arrivals = interTerminals.filter(terminal => terminal.type === 'arrival');
      await findRoutePoints(departures);
      await findRoutePoints(arrivals);
      const departureTags = await findTags(departures);
      const arrivalTags = await findTags(arrivals);
      const allTags = departureTags;
      allTags.push(
        ...arrivalTags.filter(
          arrTag => !departureTags.find(
            depTag => depTag.tag === arrTag.tag && depTag.userUuid === arrTag.userUuid
          )
        )
      );

      let terminal = null;
      if (departures.length > 0) terminal = departures[0];
      if (arrivals.length > 0) terminal = arrivals[0];

      if (terminal) {
        linkStats.push({
          locality: matchingLocality,
          latitude: terminal.latitude,
          longitude: terminal.longitude,
          departures: departures.map(dep => ({
            route: dep.route,
            ...dep.json(),
            localDateTime: getLocalDateTime(dep.createdAt, geoTz(dep.latitude, dep.longitude)[0]),
            utcDateTime: dep.createdAt,
            linkedTerminal: {
              ...dep.linkedTerminal.json(),
              localDateTime: getLocalDateTime(dep.linkedTerminal.createdAt, geoTz(dep.linkedTerminal.latitude, dep.linkedTerminal.longitude)[0]),
              utcDateTime: dep.linkedTerminal.createdAt,
            }
          })),
          arrivals: arrivals.map(arr => ({
            route: arr.route,
            ...arr.json(),
            localDateTime: getLocalDateTime(arr.createdAt, geoTz(arr.latitude, arr.longitude)[0]),
            utcDateTime: arr.createdAt,
            linkedTerminal: {
              ...arr.linkedTerminal.json(),
              localDateTime: getLocalDateTime(arr.linkedTerminal.createdAt, geoTz(arr.linkedTerminal.latitude, arr.linkedTerminal.longitude)[0]),
              utcDateTime: arr.linkedTerminal.createdAt,
            }
          })),
          tags: allTags
        });
      }

      return {
        searchResultType: 'links',
        locality: matchingLocality,
        linkedLocality,
        links: linkStats
      };

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
