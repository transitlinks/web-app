import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/checkIns');

import {
  postRepository,
  userRepository
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
  GraphQLString,
  GraphQLInt
} from 'graphql';


import { STORAGE_PATH, MEDIA_PATH } from '../../config';

const copyNonNull = (source, target, keys) => {

  keys.forEach(key => {
    if (source[key]) {
      target[key] = source[key];
    }
  });

  return target;

};

const addUserId = async (object, request) => {

  if (request.user) {
    const userId = await userRepository.getUserIdByUuid(request.user.uuid);
    object.userId = userId;
  }

  return object;

};


const getLinkedCheckIns = async (checkIn) => {

  const clientParams = checkIn.userId ? { userId: checkIn.userId } : { clientId: checkIn.clientId };
  const inboundCheckIns = await postRepository.getCheckIns({
    ...clientParams,
    createdAt: { $lt: checkIn.createdAt }
  }, {
    limit: 1,
    order: [[ 'createdAt', 'DESC' ]]
  });
  const outboundCheckIns = await postRepository.getCheckIns({
    ...clientParams,
    createdAt: { $gt: checkIn.createdAt }
  }, {
    limit: 1,
    order: [[ 'createdAt', 'ASC' ]]
  });

  const mapCheckInTags = (checkIns) => {
    return checkIns.map(checkIn => {
      return {
        ...checkIn.toJSON(),
        tags: checkIn.tags.map(tag => tag.value)
      };
    });
  };

  return {
    inbound: mapCheckInTags(inboundCheckIns),
    outbound: mapCheckInTags(outboundCheckIns)
  };

};


export const CheckInQueryFields = {

  checkIn: {

    type: CheckInType,
    description: 'Find a check-in by uuid',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {

      log.info(graphLog(request, 'find-checkin-by-uuid','uuid=${uuid}'));
      const checkIn = await postRepository.getCheckIn({ uuid });
      if (!checkIn) {
        throw new Error(`CheckIn (uuid ${uuid}) not found`);
      }

      return { ...checkIn.toJSON() };

    }

  }

};
