import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/posts');

import { uploadVideo } from '../../services/youtubeDataApi';

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
  GraphQLInt, GraphQLList,
} from 'graphql';


import { STORAGE_PATH, MEDIA_PATH } from '../../config';

const throwPrelaunchError = () => {
  throw Object.assign(new Error('Access error'), {
    extensions: {
      name: 'PrelaunchError',
      text: 'Publishing content will be available to everyone soon! Right now we are still preparing for launch and publishing is limited.',
      statusCode: 401
    }
  });
};

const throwMustBeLoggedInError = () => {
  throw Object.assign(new Error('Not logged in'), {
    extensions: {
      name: 'NotLoggedIn',
      text: 'Please, log in to create content :)',
      statusCode: 401
    }
  });
};

const requireOwnership = async (request, clientId, entity) => {

  if (!entity.uuid) return null;

  /*
  if (!request.user || request.user.email !== 'vhalme@gmail.com') {
    throwPrelaunchError();
  }
  */

  let userId = null;

  const adminUser = await userRepository.getByEmail('vhalme@gmail.com');
  if (request.user) {
    userId = await userRepository.getUserIdByUuid(request.user.uuid);
    if (adminUser.id !== userId && entity.userId !== userId) {
      throw new Error('Access not allowed for user id');
    }
  } else if (!(clientId && clientId === entity.clientId)) {
    throw new Error('Access not allowed for client id');
  }

  return userId;

};

const getEntityCredentials = async (request, entity) => {

  const credentials = {
    userAccess: 'view'
  };

  if (entity.userId) {
    const checkInUser = await userRepository.getById(entity.userId);
    if (checkInUser) {
      credentials.ownerFullName = `${checkInUser.firstName} ${checkInUser.lastName}`;
      credentials.userUuid = checkInUser.uuid;
      credentials.userImage = checkInUser.photo;
    }
    const adminUser = await userRepository.getByEmail('vhalme@gmail.com');
    if ((request.user && (adminUser.uuid === request.user.uuid || request.user.uuid === checkInUser.uuid))) {
      credentials.userAccess = 'edit';
    }
  }

  return credentials;

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
    checkInId: checkIn.id,
    checkInUuid: checkIn.uuid,
    locality: checkIn.locality,
    latitude: checkIn.latitude,
    longitude: checkIn.longitude,
    formattedAddress: checkIn.formattedAddress
  };

  if (linkedTerminal) {
    terminal.linkedTerminalId = linkedTerminal.id;
    terminal.linkedLocality = linkedTerminal.locality;
    terminal.linkedFormattedAddress = linkedTerminal.formattedAddress;
  }

  if (terminalInput.date) {
    terminal.date = new Date(terminalInput.date);
  }

  if (terminalInput.time) {
    terminal.time = new Date(terminalInput.time);
  }

  copyNonNull(terminalInput, terminal, [ 'uuid', 'clientId', 'type', 'transport', 'transportId', 'description', 'priceAmount', 'priceCurrency' ]);
  await addUserId(terminal, request);

  const saved = await postRepository.saveTerminal(terminal);

  if (linkedTerminal) {
    const linkedTerminalUpdate = copyNonNull(terminalInput, {}, [ 'transport', 'transportId', 'priceAmount', 'priceCurrency', 'description' ]);
    postRepository.saveTerminal({
      uuid: linkedTerminal.uuid,
      linkedTerminalId: saved.id,
      linkedLocality: saved.locality,
      linkedFormattedAddress: saved.formattedAddress,
      ...linkedTerminalUpdate
    });
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

  /*
  const splitByTags = saved.text.split('#');
  if (splitByTags.length > 0) {
    for (let i = 1; i < splitByTags.length; i++) {
      const tag = splitByTags[i].split(' ')[0];
      await postRepository.saveTag('Post', saved.id, tag);
      console.log('Saved tag:', tag);
    }
  }
  */

  if (postInput.tags) {
    for (let i = 0; i < postInput.tags.length; i++) {
      const tag = postInput.tags[i];
      await postRepository.saveTag('Post', saved.id, tag, request.user.uuid);
    }
  }

  //let savedMediaItems = await postRepository.getMediaItems({ entityUuid: saved.uuid });
  //const savedMediaItemUuids = savedMediaItems.map(mediaItem => mediaItem.uuid);

  const { mediaItems } = postInput;
  if (mediaItems && mediaItems.length > 0) {
    for (let i = 0; i < mediaItems.length; i++) {
      const { thumbnail, type, url, uuid } = mediaItems[i];
      //if (!savedMediaItemUuids.includes(uuid)) {
        postRepository.saveMediaItem({
          uuid, thumbnail, type, url,
          entityUuid: saved.uuid,
          entityType: 'Post'
        });
      //}

    }
  }


  saved = saved.json();
  const savedMediaItems = await postRepository.getMediaItems({ entityUuid: saved.uuid });
  saved.mediaItems = savedMediaItems.map(mediaItem => mediaItem.json());
  saved.checkInUuid = checkIn.uuid;

  return saved;

};

const saveCheckIn = async (checkInInput, clientId, request) => {

  if (!request.user) {
    throwMustBeLoggedInError();
  }

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

  return {
    ...saved.toJSON(),
    date: saved.createdAt
  };

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
        await postRepository.saveTerminal({
          uuid: linkedTerminal.uuid,
          linkedTerminalId: null,
          linkedLocality: null,
          linkedFormattedAddress: null
        });
      }
    }
  }

  await postRepository.deleteTerminals({ checkInId: checkIn.id });
  await postRepository.deleteCheckIns({ uuid: checkIn.uuid });

  return checkIn.toJSON();

};

const getLinkedCheckIns = async (checkIn) => {

  const clientParams = checkIn.userId ? { userId : checkIn.userId } : { clientId: checkIn.clientId };;
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

  return {
    inbound: inboundCheckIns.map(checkIn => checkIn.json()),
    outbound: outboundCheckIns.map(checkIn => checkIn.json())
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

const processImage = async (inputFile, outputFile) => {

  return new Promise((resolve, reject) => {

    const readableStream = fs.createReadStream(inputFile);;

    const pipeline = sharp()
      .rotate()
      .resize(600, null)
      .toBuffer((err, outputBuffer, info) => {

        if (err) {
          log.error('error processing image', err, info);
          reject(err);
        }

        writeFileSync(outputFile, outputBuffer);
        fs.unlinkSync(inputFile);

        resolve();

      });

    readableStream.pipe(pipeline);

  });


};

const processVideo = async (inputFile, outputFile, entityUuid, mediaItemUuid) => {

  fs.copyFileSync(inputFile, outputFile);

  try {

    const upload = await uploadVideo(entityUuid, mediaItemUuid, outputFile);
    log.info(`video-upload-complete video-id=${upload.id}`);

    await postRepository.saveMediaItem({
      uuid: mediaItemUuid,
      url: upload.id,
      thumbnail: upload.snippet.thumbnails.medium.url,
      uploadStatus: 'uploaded'
    });

  } catch (err) {
    console.log('process video error', err);
    await postRepository.deleteMediaItems({ uuid: mediaItemUuid });
  }

  fs.unlinkSync(inputFile);
  fs.unlinkSync(outputFile);

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
      log.info('media-item:', mediaItem);

      const { file } = request;

      console.log('uploading file', file);
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

        let entity = null;
        let entityUuid = null;
        if (mediaItem.entityType === 'CheckIn') {
          entity = await postRepository.getCheckIn({ uuid: mediaItem.entityUuid });
          entityUuid = entity.uuid;
        } else {
          throw new Error(`Invalid entity type: ` + mediaItem.entityType);
        }


        let savedMediaItem = null;
        console.log('file mimetype', file.mimetype);
        if (file.mimetype.indexOf('image') !== -1) {

          log.info(`graphql-request=upload-instance-file user=${request.user ? request.user.uuid : null} image-file-name=${entityFileName}`);

          await processImage(filePath, entityFilePath);

          savedMediaItem = await postRepository.saveMediaItem({
            entityUuid: entity.uuid,
            type: 'image',
            flag: false,
            url: `/instance-media/${entityUuid}/${entityFileName}`,
            uploadStatus: 'uploaded',
            uploadProgress: 100
          });

        } else {

          log.info(`graphql-request=upload-instance-file-video user=${request.user ? request.user.uuid : null}`);

          savedMediaItem = await postRepository.saveMediaItem({
            entityUuid: entity.uuid,
            type: 'video',
            flag: false,
            uploadProgress: 0
          });

          processVideo(filePath, entityFilePath, entityUuid, savedMediaItem.uuid);

        }

        return savedMediaItem;

      } else {
        throw new Error(`Did not find media file ${filePath})`);
      }


    }

  },

  deleteMediaItem: {

    type: MediaItemType,
    description: 'Delete a media item',
    args: {
      mediaItemUuid: { type: GraphQLString },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { mediaItemUuid, clientId }) => {
      log.info(graphLog(request, 'delete-media-item', 'uuid=' + mediaItemUuid + 'clientId=' + clientId ));
      const mediaItem = await postRepository.getMediaItem({
        uuid: mediaItemUuid
      });

      const filePath = path.join((MEDIA_PATH || path.join(__dirname, 'public')), mediaItem.url);
      console.log('DELETING MEDIA ITEM:', mediaItem.json(), filePath);
      await postRepository.deleteMediaItems({ uuid: mediaItem.uuid });
      fs.unlinkSync(filePath);

      return mediaItem.json();
    }

  },

};

export const getFeedItem = async (request, checkIn) => {

  const posts = await postRepository.getPosts({ checkInId: checkIn.id });

  log.info(graphLog(request, 'get-feed-item', 'check-in=' + checkIn.uuid + ' posts=' + posts.length));
  const linkedCheckIns = await getLinkedCheckIns(checkIn, request);
  console.log('checkin terminals', checkIn.terminals);
  const terminals = await postRepository.getTerminals({ checkInId: checkIn.id });
  const credentials = await getEntityCredentials(request, checkIn);

  log.info('check in cred', credentials);

  return {
    userAccess: credentials.userAccess,
    checkIn: {
      ...(checkIn.json()),
      user: credentials.ownerFullName,
      userImage: credentials.userImage,
      userUuid: credentials.userUuid,
      date: checkIn.createdAt
    },
    ...linkedCheckIns,
    posts: posts.map(async (post) => {
      const mediaItems = await postRepository.getMediaItems({ entityUuid: post.uuid });
      return {
        ...post.json(),
        user: credentials.ownerFullName,
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
      console.log('post', post.checkInUuid, post.checkInId);
      if (!post) {
        throw new Error(`Post (uuid ${uuid}) not found`);
      }

      const checkIn = await postRepository.getCheckIn({ id: post.checkInId });
      return { ...post.toJSON(), checkInUuid: checkIn.uuid };

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
      clientId: { type: GraphQLString },
      tags: { type: GraphQLString },
      locality: { type: GraphQLString },
      user: { type: GraphQLString },
      offset: { type: GraphQLInt },
      limit: { type: GraphQLInt }
    },
    resolve: async ({ request }, { clientId, tags, locality, user, offset, limit }) => {

      log.info(graphLog(request, 'get-feed'));

      let checkIns = [];

      const options = {
        order: (user || tags || locality) ? [
          ['createdAt', 'DESC']
        ] : [
          ['id', 'DESC']
        ]
      };

      if (offset) options.offset = offset;
      if (limit) options.limit = limit;

      let userId = null;
      if (user) {
        userId = await userRepository.getUserIdByUuid(user);
      }

      if (tags) {
        const tagsArray = tags.split(',');
        const query = { tags: tagsArray, userId };
        checkIns = await postRepository.getTaggedCheckIns(query, options);
        console.log('result for tags', tagsArray);
      } else {
        const query = {};
        if (locality) query.locality = locality;
        if (userId) query.userId = userId;
        checkIns = await postRepository.getFeedCheckIns(query, options);
      }

      // console.log('returning checkins', checkIns);
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

  openTerminals: {

    type: new GraphQLList(TerminalType),
    description: 'Open terminals for user',
    args: {
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { clientId }) => {

      const openTerminalParams = { linkedTerminalId: null };

      if (request.user) {
        const userId = await userRepository.getUserIdByUuid(request.user.uuid);
        openTerminalParams.userId = userId;
      } else if (clientId) {
        openTerminalParams.clientId = clientId;
      }

      const openTerminals = await postRepository.getTerminals(openTerminalParams);

      const result = openTerminals.map(async (terminal) => {
        const terminalCheckIn = await postRepository.getCheckIn({ id: terminal.checkInId });
        return {
          ...terminal.json(),
          checkIn: terminalCheckIn.json()
        };
      });

      return result;

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

  },

  mediaItem: {

    type: MediaItemType,
    description: 'Query media item',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {

      log.info(graphLog(request, 'get-media-item', 'uuid=' + uuid));
      const mediaItem = await postRepository.getMediaItem({ uuid });
      if (!mediaItem) {
        throw new Error(`MediaItem (uuid ${uuid}) not found`);
      }

      return mediaItem.json();

    }

  }


};
