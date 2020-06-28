import fs from 'fs';
import path from 'path';
import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/links');

import { uploadVideo } from '../../services/youtubeDataApi';

import {
  localityRepository,
  linkRepository,
  checkInRepository,
  terminalRepository, userRepository,
} from '../source';

import {
  MediaItemType, LinkSearchResultType,
} from '../types/TransitLinkType';

import {
  GraphQLString,
  GraphQLList,
} from 'graphql';

import { STORAGE_PATH, MEDIA_PATH } from '../../config';


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
      });
      terminal.route = (routeCheckIns || {}).map(checkIn => ({ lat: checkIn.latitude, lng: checkIn.longitude }));
    }
  }
};

export const TransitLinkQueryFields = {

  transitLinks: {

    type: new GraphQLList(LinkSearchResultType),
    description: 'Search terminals',
    args: {
      locality: { type: GraphQLString },
      tag: { type: GraphQLString },
      user: { type: GraphQLString },
      type: { type: GraphQLString }
    },
    resolve: async ({ request }, params) => {

      const { locality, tag, user, type } = params;

      log.info(graphLog(request, 'search-links',`locality=${locality} tag=${tag} type=${type}`));

      const linkStats = [];

      if (!tag) {
        const localityQuery = {
          limit: 16
        };
        if (locality) localityQuery.search = locality;
        const localities = await localityRepository.getCheckInLocalities(localityQuery);

        for (let i = 0; i < localities.length; i++) {
          const locality = localities[i];
          const interTerminals = await terminalRepository.getInterTerminalsByLocality(locality);
          const departures = interTerminals.filter(terminal => terminal.type === 'departure');
          const arrivals = interTerminals.filter(terminal => terminal.type === 'arrival');
          const internal = await terminalRepository.getInternalDeparturesByLocality(locality);
          await findRoutePoints(departures);
          await findRoutePoints(arrivals);
          await findRoutePoints(internal);
          let terminal = null;
          if (departures.length > 0) terminal = departures[0];
          if (arrivals.length > 0) terminal = arrivals[0];
          if (internal.length > 0) terminal = internal[0];
          if (terminal) {
            linkStats.push({
              locality,
              latitude: terminal.latitude,
              longitude: terminal.longitude,
              departures,
              arrivals,
              internal
            });
          }
        }
      } else {

        const taggedCheckIns = await checkInRepository.getTaggedCheckIns({ tags: [tag] }, { order: [[ 'createdAt', 'ASC' ]] });

        if (taggedCheckIns.length > 0) {

          const query = {
            checkInId: taggedCheckIns.map(checkIn => checkIn.id),
            type: 'departure'
          };
          if (user) {
            const userId = await userRepository.getUserIdByUuid(user);
            query.userId = userId;
          }

          const departures = await terminalRepository.getTerminals(query);
          await findRoutePoints(departures);
          let terminal = null;
          if (departures.length > 0) terminal = departures[0];
          if (terminal) {
            linkStats.push({
              locality,
              latitude: terminal.latitude,
              longitude: terminal.longitude,
              departures: departures.map(departure => departure.json()),
              arrivals: [],
              internal: []
            });
          }
        }

      }


      return linkStats;

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
