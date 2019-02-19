import fs from 'fs';
import path from 'path';
import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/posts');

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
  FeedItemType,
  FeedType
} from '../types/PostType';

import {
  GraphQLString
} from 'graphql';

import { STORAGE_PATH, MEDIA_PATH, MEDIA_URL, APP_URL } from '../../config';

const copyNonNull = (source, target, keys) => {

  keys.forEach(key => {
    if (source[key]) {
      target[key] = source[key];
    }
  });

  return target;

};

const addUserId = (object, request) => {

  if (request.user) {
    const userId = userRepository.getUserIdByUuid(request.user.uuid);
    object.userId = userId;
  }

  return object;

};


const saveTerminal = async (terminalInput, request) => {

  const { checkInUuid } = terminalInput;
  const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
  if (!checkIn) {

  }

  const terminal = {
    checkInId: checkIn.id
  };

  if (terminalInput.date) {
    terminal.date = new Date(terminalInput.date);
  }

  if (terminalInput.time) {
    terminal.time = new Date(terminalInput.time);
  }

  copyNonNull(terminalInput, terminal, [ 'uuid', 'clientId', 'type', 'transport', 'transportId', 'priceAmount', 'priceCurrency' ]);
  addUserId(terminal, request);

  const saved = await postRepository.saveTerminal(terminal);
  return saved.toJSON();

};


const savePost = async (postInput, request) => {

  const { checkInUuid } = postInput;
  const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
  if (!checkIn) {

  }

  const post = {
    checkInId: checkIn.id,
    text: postInput.text
  };

  copyNonNull(postInput, post, [ 'uuid', 'clientId' ]);
  addUserId(post, request);

  const saved = await postRepository.savePost(post);
  return saved.toJSON();

};

const saveCheckIn = async (checkInInput, request) => {

  const checkIn = copyNonNull(checkInInput, {}, [
    'uuid', 'clientId', 'latitude', 'longitude', 'placeId', 'locality', 'country', 'formattedAddress'
  ]);
  addUserId(checkIn, request);

  const lastCheckIns = await postRepository.getCheckIns({ clientId: checkInInput.clientId }, {
    limit: 1,
    order: [[ 'createdAt', 'DESC' ]]
  });

  if (lastCheckIns.length > 0) {
    checkIn.prevCheckInId = lastCheckIns[0].id;
  };

  const saved = await postRepository.saveCheckIn(checkIn);

  if (lastCheckIns.length > 0) {
    await postRepository.saveCheckIn({ uuid: lastCheckIns[0].uuid, nextCheckInId: saved.id });
  };

  return saved.toJSON();

};

const getLinkedCheckIns = async (checkIn) => {

  const inboundCheckIns = await postRepository.getCheckIns({ nextCheckInId: checkIn.id });
  const outboundCheckIns = await postRepository.getCheckIns({ prevCheckInId: checkIn.id });

  return {
    inbound: inboundCheckIns.map(checkIn => checkIn.toJSON()),
    outbound: outboundCheckIns.map(checkIn => checkIn.toJSON())
  };

};

export const PostMutationFields = {

  post: {

    type: PostType,
    description: 'Create or update a post',
    args: {
      post: { type: PostInputType }
    },
    resolve: async ({ request }, { post }) => {
      log.info(graphLog(request, 'save-post', 'clientId=' + post.clientId + ' uuid=' + post.uuid));
      return await savePost(post, request);
    }

  },

  terminal: {

    type: TerminalType,
    description: 'Create or update a terminal',
    args: {
      terminal: { type: TerminalInputType }
    },
    resolve: async ({ request }, { terminal }) => {
      log.info(graphLog(request, 'save-terminal'));
      return await saveTerminal(terminal, request);
    }

  },

  checkIn: {

    type: CheckInType,
    description: 'Create or update a check-in',
    args: {
      checkIn: { type: CheckInInputType }
    },
    resolve: async ({ request }, { checkIn }) => {
      log.info(graphLog(request, 'save-check-in', 'clientId=' + checkIn.clientId + ' uuid=' + checkIn.uuid));
      return await saveCheckIn(checkIn, request);
    }

  }

};

export const PostQueryFields = {

  post: {

    type: PostType,
    description: 'Find a post by uuid',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {

      log.info(graphLog(request, 'find-post-by-uuid','uuid=${uuid}'));
      const post = await postRepository.getPost({ uuid });
      if (!post) {
        throw new Error(`Post (uuid ${uuid}) not found`);
      }

      return post.toJSON();

    }

  },

  posts: {

    type: PostsType,
    description: 'Find posts',
    args: {
      input: { type: GraphQLString }
    },
    resolve: async ({ request }, { input }) => {

      log.info(graphLog(request, 'find-posts'));
      const posts = await postRepository.getFeedPosts(request.user ? request.user.id : null);
      log.info(graphLog(request, 'find-posts', 'results=' + posts.length));
      return { posts: posts.map(post => post.toJSON()) };

    }

  },

  feed: {

    type: FeedType,
    description: 'Query feed',
    args: {
      input: { type: GraphQLString }
    },
    resolve: async ({ request }, { input }) => {

      log.info(graphLog(request, 'get-feed'));
      const checkIns = await postRepository.getFeedCheckIns(request.user ? request.user.id : null);
      log.info(graphLog(request, 'get-feed', 'check-ins=' + checkIns.length));
      return {
        feedItems: checkIns.map(async (checkIn) => {
          const posts = await postRepository.getPosts({ checkInId: checkIn.id });
          log.info(graphLog(request, 'get-feed', 'check-in=' + checkIn.uuid + ' posts=' + posts.length));
          const linkedCheckIns = await getLinkedCheckIns(checkIn);
          const terminals = await postRepository.getTerminals({ checkInId: checkIn.id });
          console.log("LINKED", linkedCheckIns);
          return {
            checkIn: checkIn.json(),
            ...linkedCheckIns,
            posts: posts.map(post => post.json()),
            terminals: terminals.map(terminal => terminal.json())
          };
        })
      };

    }

  },

  feedItem: {

    type: FeedItemType,
    description: 'Query feed item',
    args: {
      checkInUuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { checkInUuid }) => {

      log.info(graphLog(request, 'get-feed-item', 'uuid=' + checkInUuid));
      const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
      const posts = await postRepository.getPosts({ checkInId: checkIn.id });
      const terminals = await postRepository.getTerminals({ checkInId: checkIn.id });
      const linkedCheckIns = await getLinkedCheckIns(checkIn);
      return {
        checkIn: checkIn.toJSON(),
        ...linkedCheckIns,
        posts: posts.map(post => post.toJSON()),
        terminals: terminals.map(terminal => terminal.toJSON())
      };

    }

  }


};
