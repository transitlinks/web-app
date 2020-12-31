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
  MediaItemType, LinkSearchResultType, LocalitySearchResultsType,
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

const findTrips = async (terminals) => {
  const allTrips = [];
  for (let i = 0; i < terminals.length; i++) {
    const terminal = terminals[i];
    const trips = await tripRepository.getTripsByCheckInIds([terminal.checkInId]);
    const { linkedTerminal } = terminal;
    if (linkedTerminal) {
      const linkedTrips = await tripRepository.getTripsByCheckInIds([linkedTerminal.checkInId]);
      trips.push(
        ...linkedTrips.filter(linkedTrip => !trips.find(trip => trip.uuid === linkedTrip.uuid))
      );
    }

    allTrips.push(...trips);
    terminal.trips = trips;
  }
  return allTrips;
};

export const TransitLinkQueryFields = {

  transitLinks: {

    type: LinkSearchResultType,
    description: 'Search terminals',
    args: {
      localityUuid: { type: GraphQLString },
      country: { type: GraphQLString },
      linkedLocalityUuid: { type: GraphQLString },
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

      const { localityUuid, country, linkedLocalityUuid, from, to, tag, trip, user, type, search, transportTypes } = params;

      log.info(graphLog(request, 'search-links',`search=${search} localityUuid=${localityUuid} tag=${tag} type=${type}`));

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
            filteredCheckIns = await checkInRepository.getTripCheckIns(tripEntity.id, !tripEntity.lastCheckInId);
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
              localityUuid: terminal.localityUuid,
              localityLong: terminal.localityLong,
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

        const fromLocality = await localityRepository.getLocality({ uuid: from });
        const toLocality = await localityRepository.getLocality({ uuid: to });
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
              localityLong: terminal.localityLong,
              latitude: terminal.latitude,
              longitude: terminal.longitude,
              from: fromLocality.name,
              to: toLocality.name,
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
          fromName: fromLocality.nameLong,
          toName: toLocality.nameLong,
          links: linkStats
        };

      }

      const localityQuery = { limit: 16 };
      const transportQuery = {};

      if (localityUuid) localityQuery.localityUuid = localityUuid;
      if (search) localityQuery.search = search;
      if (transportTypes && transportTypes.length > 0) {
        localityQuery.transportTypes = transportTypes;
        transportQuery.transport = transportTypes;
      }

      const localities = await localityRepository.getMostTravelledLocalities(localityQuery);
      console.log('GET LOCALITIES', localities);
      const singleLocality = localities.length === 1 ? localities[0].locality : null;
      const singleLocalityLong = localities.length === 1 ? localities[0].localityLong : null;
      const singleLocalityUuid = localities.length === 1 ? localities[0].localityUuid : null;

      const linkedLocality = await localityRepository.getLocality({ uuid: linkedLocalityUuid });
      if (!linkedLocality) {

        const baseQuery = {
          ...((transportTypes && transportTypes.length > 0) && { transport: transportTypes })
        };

        const getLinkedLocalityInfo = async (uuid, linked, type) => {

          const terminal = await terminalRepository.getTerminal({
            localityUuid: uuid,
            linkedLocalityUuid: linked.linkedLocalityUuid,
            type,
            linkedTerminalId: { $ne: null }
          });

          if (!terminal) return null;

          const counts = await terminalRepository.countInterTerminals({
            localityUuid: uuid, linkedLocalityUuid: linked.linkedLocalityUuid
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
            linkedLocality: linked.linkedLocality,
            linkedLocalityLong: linked.linkedLocalityLong,
            linkCount: counts[type]
          };

        };

        for (let i = 0; i < localities.length; i++) {

          const terminalLocality = localities[i].locality;
          const terminalLocalityUuid = localities[i].localityUuid;
          const terminalLocalityLong = localities[i].localityLong;
          const interTerminalCounts = await terminalRepository.countInterTerminals({
            ...baseQuery, localityUuid: terminalLocalityUuid
          });

          const departureLinks = [];
          const linkedDepartureLocalities = await terminalRepository.getLinkedLocalitiesByLocality({
            ...baseQuery, localityUuid: terminalLocalityUuid,
            type: 'departure'
          });
          for (let i = 0; i < linkedDepartureLocalities.length; i++) {
            departureLinks.push(await getLinkedLocalityInfo(terminalLocalityUuid, linkedDepartureLocalities[i], 'departure'));
          }
          console.log('DEPS', linkedDepartureLocalities);

          const arrivalLinks = [];
          const linkedArrivalLocalities = await terminalRepository.getLinkedLocalitiesByLocality({
            ...baseQuery, localityUuid: terminalLocalityUuid,
            type: 'arrival'
          });
          for (let i = 0; i < linkedArrivalLocalities.length; i++) {
            arrivalLinks.push(await getLinkedLocalityInfo(terminalLocalityUuid, linkedArrivalLocalities[i], 'arrival'));
          }
          console.log('ARRS', linkedArrivalLocalities);

          const terminal = await terminalRepository.getTerminal({ localityUuid: terminalLocalityUuid });

          const departures = departureLinks.filter(dep => dep).map(dep => dep.terminal);
          const arrivals = arrivalLinks.filter(arr => arr).map(arr => arr.terminal);

          const internal = await terminalRepository.getInternalDeparturesByLocality(terminalLocalityUuid, baseQuery);

          const tags = await tagRepository.getLatestTagsByLocality(terminalLocalityUuid, 7);
          const trips = await tripRepository.getLatestTripsByLocality(terminalLocalityUuid, 7);

          linkStats.push({
            locality: terminalLocality,
            localityLong: terminalLocalityLong,
            localityUuid: terminalLocalityUuid,
            latitude: terminal.latitude,
            longitude: terminal.longitude,
            departureCount: interTerminalCounts.arrival || 0,
            arrivalCount: interTerminalCounts.departure || 0,
            departures,
            arrivals,
            internal,
            linkedDepartures: departures.map(dep => ({
              linkedLocality: dep.linkedTerminal.locality,
              linkedLocalityLong: dep.linkedTerminal.localityLong,
              linkedLocalityUuid: dep.linkedTerminal.localityUuid,
            })),
            linkedArrivals: arrivals.map(arr => ({
              linkedLocality: arr.linkedTerminal.locality,
              linkedLocalityLong: arr.linkedTerminal.localityLong,
              linkedLocalityUuid: arr.linkedTerminal.localityUuid
            })),
            tags,
            trips
          });

        }

        console.log('SINGLE OOCA', singleLocality, singleLocalityLong, singleLocalityUuid);
        return {
          searchResultType: 'connections',
          links: linkStats,
          locality: singleLocality,
          localityLong: singleLocalityLong,
          localityUuid: singleLocalityUuid
        };

      }
      const baseQuery = {
        ...((transportTypes && transportTypes.length > 0) && { transport: transportTypes }),
        linkedLocalityUuid
      };

      const matchingLocality = localities[0];
      const interTerminals = await terminalRepository.getInterTerminalsByLocality(matchingLocality.localityUuid, baseQuery);
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

      const departureTrips = await findTrips(departures);
      const arrivalTrips = await findTrips(arrivals);
      const allTrips = departureTrips;
      allTrips.push(
        ...arrivalTrips.filter(arrTrip => !departureTrips.find(depTrip => depTrip.uuid === arrTrip.uuid))
      );

      let terminal = null;
      if (departures.length > 0) terminal = departures[0];
      if (arrivals.length > 0) terminal = arrivals[0];

      if (terminal) {
        linkStats.push({
          locality: matchingLocality.locality,
          localityLong: matchingLocality.localityLong,
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
          tags: allTags,
          trips: allTrips
        });
      }

      return {
        searchResultType: 'links',
        locality: matchingLocality.locality,
        localityLong: matchingLocality.localityLong,
        linkedLocality: linkedLocality.name,
        linkedLocalityLong: linkedLocality.nameLong,
        links: linkStats
      };

    }

  },

  localities: {

    type: new GraphQLList(LocalitySearchResultsType),
    description: 'Search localities',
    args: {
      search: { type: GraphQLString },
      from: { type: GraphQLString }
    },
    resolve: async ({ request }, { search, from }) => {

      const localities = await localityRepository.searchLocalitiesByName(search);
      return localities.map(locality => locality.json());

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
