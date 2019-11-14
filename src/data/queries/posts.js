import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/posts');

import { getVideos, uploadVideo } from '../../services/youtubeDataApi';

import {
  postRepository,
  userRepository,
  placesApi, linkRepository
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
  GraphQLString
} from 'graphql';


import { STORAGE_PATH, MEDIA_PATH, MEDIA_URL, APP_URL } from '../../config';


const requireOwnership = async (request, clientId, entity) => {

  if (!entity.uuid) return null;

  let userId = null;

  if (request.user) {
    userId = await userRepository.getUserIdByUuid(request.user.uuid);
    if (entity.userId !== userId) {
      throw new Error('Access not allowed for user id');
    }
  }  else if (!(clientId && clientId === entity.clientId)) {
    throw new Error('Access not allowed for client id');
  }

  return userId;

};

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


const saveTerminal = async (terminalInput, clientId, request) => {

  if (terminalInput.uuid) {
    const savedTerminal = await postRepository.getTerminal({ uuid: terminalInput.uuid });
    await requireOwnership(request, clientId, savedTerminal);
  }


  const { checkInUuid, linkedTerminalUuid } = terminalInput;
  const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
  const linkedTerminal = await postRepository.getTerminal({ uuid: linkedTerminalUuid });

  if (!checkIn) {
    //TODO: Process error
  }

  if (!linkedTerminal) {
    //TODO: Process error
  }

  const terminal = {
    checkInId: checkIn.id
  };

  if (linkedTerminal) {
    terminal.linkedTerminalId = linkedTerminal.id;
  }

  if (terminalInput.date) {
    terminal.date = new Date(terminalInput.date);
  }

  if (terminalInput.time) {
    terminal.time = new Date(terminalInput.time);
  }

  copyNonNull(terminalInput, terminal, [ 'uuid', 'clientId', 'type', 'transport', 'transportId', 'priceAmount', 'priceCurrency' ]);
  await addUserId(terminal, request);

  const saved = await postRepository.saveTerminal(terminal);

  if (linkedTerminal) {
    const linkedTerminalUpdate = copyNonNull(terminalInput, {}, [ 'transport', 'transportId', 'priceAmount', 'priceCurrency' ]);
    postRepository.saveTerminal({ uuid: linkedTerminal.uuid, linkedTerminalId: saved.id, ...linkedTerminalUpdate });
  }

  return saved.toJSON();

};


const savePost = async (postInput, clientId, request) => {

  if (postInput.uuid) {
    const savedPost = await postRepository.getPost({ uuid: postInput.uuid });
    await requireOwnership(request, clientId, savedPost);
  }

  const { checkInUuid } = postInput;
  const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
  if (!checkIn) {
    // TODO: Error
  }

  const post = {
    checkInId: checkIn.id,
    text: postInput.text
  };

  copyNonNull(postInput, post, [ 'uuid', 'clientId' ]);
  await addUserId(post, request);

  let saved = await postRepository.savePost(post);

  const { mediaItems } = postInput;
  if (mediaItems && mediaItems.length > 0) {
    for (let i = 0; i < mediaItems.length; i++) {
      const { thumbnail, type, url } = mediaItems[i];
      postRepository.saveMediaItem({
        thumbnail, type, url,
        entityUuid: saved.uuid,
        entityType: 'Post'
      });
    }
  }


  saved = saved.json();
  saved.mediaItems = mediaItems;

  return saved;

};

const saveCheckIn = async (checkInInput, clientId, request) => {

  let userId = null;
  if (checkInInput.uuid) {
    const savedCheckIn = await postRepository.getCheckIn({ uuid: checkInInput.uuid });
    userId = await requireOwnership(request, clientId, savedCheckIn);
  }

  const checkIn = copyNonNull(checkInInput, {}, [
    'uuid', 'clientId', 'latitude', 'longitude', 'placeId', 'locality', 'country', 'formattedAddress', 'date'
  ]);

  if (checkIn.date) {
    checkIn.createdAt = checkIn.date;
    checkIn.updatedAt = checkIn.date;
  }

  await addUserId(checkIn, request);

  const clientParams = userId ? { userId } : { clientId: checkInInput.clientId };
  const lastCheckIns = await postRepository.getCheckIns(clientParams, {
    limit: 1,
    order: [[ 'createdAt', 'DESC' ]]
  });

  console.log("SAVING CHECK IN", lastCheckIns.length);
  if (lastCheckIns.length > 0) {
    checkIn.prevCheckInId = lastCheckIns[0].id;
    console.log("PREV CHECK IN ID", lastCheckIns[0].id);
  };

  const saved = await postRepository.saveCheckIn(checkIn);

  if (lastCheckIns.length > 0) {
    await postRepository.saveCheckIn({ uuid: lastCheckIns[0].uuid, nextCheckInId: saved.id });
    console.log("NEXT CHECK IN ID", saved.id);
  };

  return saved.toJSON();

};

const deleteCheckIn = async (checkInUuid, clientId, request) => {

  const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
  await requireOwnership(request, clientId, checkIn);

  const nextCheckIn = await postRepository.getCheckIn({ nextCheckInId: checkIn.id });
  const prevCheckIn = await postRepository.getCheckIn({ prevCheckInId: checkIn.id });

  if (prevCheckIn) {
    if (nextCheckIn) {
      await postRepository.saveCheckIn({ uuid: prevCheckIn.uuid, nextCheckInId: nextCheckIn.id });
    }
  }

  if (nextCheckIn) {
    if (prevCheckIn) {
      await postRepository.saveCheckIn({ uuid: nextCheckIn.uuid, prevCheckInId: prevCheckIn.id });
    }
  }

  await postRepository.deletePosts({ checkInId: checkIn.id });
  const terminals = await postRepository.getTerminals({ checkInId: checkIn.id });
  for (let i = 0; i < terminals.length; i++) {
    if (terminals[i].linkedTerminalId) {
      const linkedTerminal = await postRepository.getTerminal({ id: terminals[i].linkedTerminalId });
      if (linkedTerminal) {
        await postRepository.saveTerminal({uuid: linkedTerminal.uuid, linkedTerminalId: null});
      }
    }
  }

  await postRepository.deleteTerminals({ checkInId: checkIn.id });
  await postRepository.deleteCheckIns({ uuid: checkIn.uuid });

  return checkIn.toJSON();

};

const getLinkedCheckIns = async (checkIn) => {

  const inboundCheckIns = await postRepository.getCheckIns({ nextCheckInId: checkIn.id });
  const outboundCheckIns = await postRepository.getCheckIns({ prevCheckInId: checkIn.id });

  return {
    inbound: inboundCheckIns.map(checkIn => checkIn.toJSON()),
    outbound: outboundCheckIns.map(checkIn => checkIn.toJSON())
  };

};

const writeFileSync = (path, buffer) => {

  const permission = 438;
  let fileDescriptor;

  try {
    fileDescriptor = fs.openSync(path, 'w', permission);
  } catch (e) {
    log.error('Error opening file for writing', e);
    fs.chmodSync(path, permission);
    fileDescriptor = fs.openSync(path, 'w', permission);
  }

  if (fileDescriptor) {
    fs.writeSync(fileDescriptor, buffer, 0, buffer.length, 0);
    fs.closeSync(fileDescriptor);
    log.info('wrote file', path);
  }

};

const processImage = (inputFile, outputFile) => {

  const readableStream = fs.createReadStream(inputFile);;

  const pipeline = sharp()
    .rotate()
    .resize(600, null)
    .toBuffer(function (err, outputBuffer, info) {
      writeFileSync(outputFile, outputBuffer);
    });

  readableStream.pipe(pipeline);

};

export const PostMutationFields = {

  post: {

    type: PostType,
    description: 'Create or update a post',
    args: {
      post: { type: PostInputType },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { post, clientId }) => {
      log.info(graphLog(request, 'save-post', 'clientId=' + post.clientId + ' uuid=' + post.uuid));
      return await savePost(post, clientId, request);
    }

  },

  terminal: {

    type: TerminalType,
    description: 'Create or update a terminal',
    args: {
      terminal: { type: TerminalInputType },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { terminal, clientId }) => {
      log.info(graphLog(request, 'save-terminal'));
      return await saveTerminal(terminal, clientId, request);
    }

  },

  checkIn: {

    type: CheckInType,
    description: 'Create or update a check-in',
    args: {
      checkIn: { type: CheckInInputType },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { checkIn, clientId }) => {
      log.info(graphLog(request, 'save-check-in', 'clientId=' + checkIn.clientId + ' uuid=' + checkIn.uuid));
      return await saveCheckIn(checkIn, clientId, request);
    }

  },

  deleteCheckIn: {

    type: CheckInType,
    description: 'Delete a check-in',
    args: {
      checkInUuid: { type: GraphQLString },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { checkInUuid, clientId }) => {
      log.info(graphLog(request, 'delete-check-in', 'uuid=' + checkInUuid + 'clientId=' + clientId ));
      return await deleteCheckIn(checkInUuid, clientId, request);
    }

  },

  mediaItem: {

    type: MediaItemType,
    description: 'Upload media files',
    args: {
      mediaItem: { type: MediaItemInputType }
    },
    resolve: async ({ request }, { mediaItem }) => {

      log.info(`graphql-request=upload-media-file user=${request.user ? request.user.uuid : null}`);
      console.log("media item", mediaItem);;

      const { file } = request;

      const nameParts = file.originalname.split('.');
      const extension = nameParts[nameParts.length - 1];
      const savePath = STORAGE_PATH || path.join(__dirname, 'public');
      const filePath = path.join(savePath, file.filename);

      const mediaPath = path.join((MEDIA_PATH || path.join(__dirname, 'public')), 'instance-media');
      const entityPath = path.join(mediaPath, mediaItem.entityUuid);

      if (fs.existsSync(filePath)) {

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath);
        }
        if (!fs.existsSync(entityPath)) {
          fs.mkdirSync(entityPath);
        }

        const now = (new Date()).getTime();
        const entityFileName = `${now}.${extension}`;
        const entityFilePath = path.join(entityPath, entityFileName);
        processImage(filePath, entityFilePath);

        let entity = null;
        let entityUuid = null;
        if (mediaItem.entityType === 'CheckIn') {
          entity = await postRepository.getCheckIn({ uuid: mediaItem.entityUuid });
          entityUuid = entity.uuid;
        } else {
          throw new Error(`Invalid entity type: ` + mediaItem.entityType);
        }


        let savedMediaItem = null;

        if (file.mimetype.indexOf('image') !== -1) {

          log.info(`graphql-request=upload-instance-file user=${request.user ? request.user.uuid : null} image-file-name=${entityFileName}`);

          savedMediaItem = await postRepository.saveMediaItem({
            entityUuid: entity.uuid,
            type: 'image',
            flag: false,
            url: `/instance-media/${entityUuid}/${entityFileName}`
          });

        } else {

          const upload = await uploadVideo(entityUuid, entityFilePath);
          const thumbnail = upload.snippet.thumbnails.medium.url;
          log.info(`graphql-request=upload-instance-file user=${request.user ? request.user.uuid : null} video-id=${upload.id}`);

          savedMediaItem = await postRepository.saveMediaItem({
            entityUuid: entity.uuid,
            type: 'video',
            flag: false,
            url: upload.id,
            thumbnail
          });

        }

        return savedMediaItem;

      } else {
        throw new Error(`Did not find media file ${filePath})`);
      }


    }

  }

};

export const getFeedItem = async (request, checkIn) => {

  const posts = await postRepository.getPosts({ checkInId: checkIn.id });

  log.info(graphLog(request, 'get-feed', 'check-in=' + checkIn.uuid + ' posts=' + posts.length));
  const linkedCheckIns = await getLinkedCheckIns(checkIn);
  const terminals = await postRepository.getTerminals({ checkInId: checkIn.id });

  let checkInUser = null;
  if (checkIn.userId) {
    checkInUser = await userRepository.getById(checkIn.userId);
    checkInUser = checkInUser.firstName + ' ' + checkInUser.lastName;
  }

  return {
    checkIn: {
      ...(checkIn.json()),
      user: checkInUser,
      date: checkIn.createdAt
    },
    ...linkedCheckIns,
    posts: posts.map(async (post) => {
      const mediaItems = await postRepository.getMediaItems({ entityUuid: post.uuid });
      let userName = null;
      if (post.userId) {
        const user = await userRepository.getById(post.userId);
        userName = user.firstName + ' ' + user.lastName;
      }
      return {
        ...post.json(),
        user: userName,
        mediaItems: mediaItems.map(mediaItem => mediaItem.json())
      };
    }),
    terminals: terminals.map(async (terminal) => {

      let linkedTerminal = null;

      if (terminal.linkedTerminalId) {
        linkedTerminal = await postRepository.getTerminal({ id: terminal.linkedTerminalId });
        const linkedTerminalCheckIn = await postRepository.getCheckIn({ id: linkedTerminal.checkInId });
        linkedTerminal = linkedTerminal.json();
        linkedTerminal.checkIn = linkedTerminalCheckIn.json();
      }

      return {
        ...terminal.json(),
        linkedTerminal
      };

    })
  };

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
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { clientId }) => {

      log.info(graphLog(request, 'get-feed'));
      const checkIns = await postRepository.getFeedCheckIns(request.user ? request.user.id : null);
      const openTerminalParams = { linkedTerminalId: null };

      if (request.user) {
        const userId = await userRepository.getUserIdByUuid(request.user.uuid);
        openTerminalParams.userId = userId;
      } else if (clientId) {
        openTerminalParams.clientId = clientId;
      }

      const openTerminals = await postRepository.getTerminals(openTerminalParams);
      log.info(graphLog(request, 'get-feed', 'check-ins=' + checkIns.length));
      return {
        feedItems: checkIns.map(async (checkIn) => {
          return await getFeedItem(request, checkIn);
        }),
        openTerminals: openTerminals.map(async (terminal) => {
          const terminalCheckIn = await postRepository.getCheckIn({ id: terminal.checkInId });
          return {
            ...terminal.json(),
            checkIn: terminalCheckIn
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
      return await getFeedItem(request, checkIn);

    }

  }


};
