import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/posts');

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import geoTz from 'geo-tz';
import uuidValidate from 'uuid-validate';
import moment from 'moment-timezone';
import { getDistance } from 'geolib';
import ExifReader from 'exifreader';
import urlencode from 'urlencode';

import { uploadVideo, deleteVideo } from '../../services/vimeoDataApi';

import {
  postRepository,
  userRepository,
  tagRepository,
  checkInRepository,
  terminalRepository,
  commentRepository, localityRepository, tripRepository,
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

import {
  requireOwnership,
  throwTimelineConflictError,
} from './utils';

import { STORAGE_PATH, MEDIA_PATH } from '../../config';
import { getLocalDateTime } from '../../core/utils';
import { findRoutePoints } from './links';

const throwPrelaunchError = () => {
  throw Object.assign(new Error('Access error'), {
    extensions: {
      name: 'PrelaunchError',
      text: 'Publishing content will be available to everyone soon! Right now we are still preparing for launch and publishing is limited.',
      statusCode: 401
    }
  });
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

const adjustConnection = async (departure) => {

  console.log(`Adjusting connection: (${departure.id}) ${departure.locality}, (${departure.linkedTerminalId}) ${departure.linkedLocality}`);

  const routePoints = await terminalRepository.getRoutePoints(departure);
  routePoints.unshift(departure.get());
  routePoints.push(departure.linkedTerminal.get());
  let totalDistance = 0;
  for (let i = 0; i < routePoints.length - 1; i++) {
    const fromPoint = { latitude: routePoints[i].latitude, longitude: routePoints[i].longitude };
    const toPoint = { latitude: routePoints[i + 1].latitude, longitude: routePoints[i + 1].longitude };
    const distance = getDistance(fromPoint, toPoint);
    totalDistance += distance / 1000;
  }

  await terminalRepository.saveConnection(departure.id, departure.linkedTerminal.id, totalDistance);

};

const saveTerminal = async (terminalInput, clientId, request) => {

  let existingTerminal = null;
  if (terminalInput.uuid) {
    existingTerminal = await terminalRepository.getTerminal({ uuid: terminalInput.uuid });
  }

  const userId = await requireOwnership(request, existingTerminal, clientId);

  const { checkInUuid, linkedTerminalUuid } = terminalInput;

  const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
  if (!checkIn) throw new Error('Could not find Check In for Terminal');

  let newLinkedTerminal = null;
  if (linkedTerminalUuid) {
    newLinkedTerminal = await terminalRepository.getTerminal({ uuid: linkedTerminalUuid });
  }

  const newTerminal = {
    checkInId: checkIn.id,
    checkInUuid: checkIn.uuid,
    localityUuid: checkIn.localityUuid,
    locality: checkIn.locality,
    localityLong: checkIn.localityLong,
    country: checkIn.country,
    latitude: checkIn.latitude,
    longitude: checkIn.longitude,
    formattedAddress: checkIn.formattedAddress
  };

  if (!existingTerminal) newTerminal.userId = userId;

  if (newLinkedTerminal) {
    newTerminal.linkedTerminalId = newLinkedTerminal.id;
    newTerminal.linkedLocalityUuid = newLinkedTerminal.localityUuid;
    newTerminal.linkedLocality = newLinkedTerminal.locality;
    newTerminal.linkedLocalityLong = newLinkedTerminal.localityLong;
    newTerminal.linkedFormattedAddress = newLinkedTerminal.formattedAddress;
    if (!terminalInput.transportId) newTerminal.transportId = newLinkedTerminal.transportId;
    if (!terminalInput.priceAmount) newTerminal.priceAmount = newLinkedTerminal.priceAmount;
    if (!terminalInput.priceCurrency) newTerminal.priceCurrency = newLinkedTerminal.priceCurrency;
  }

  copyNonNull(terminalInput, newTerminal, [ 'uuid', 'clientId', 'type', 'transport', 'transportId', 'description', 'priceAmount', 'priceCurrency', 'priceType' ]);

  const timeZone = geoTz(checkIn.latitude, checkIn.longitude)[0];

  if (terminalInput.date) {

    log.info('TERM INPUT DATE', terminalInput.date);
    const tzDateTime = moment.tz(terminalInput.date, timeZone);
    log.info('tzDateTime', tzDateTime);
    const tzDateTimeValue = tzDateTime.format();
    log.info('tzDateTimeValue', tzDateTimeValue);

    const newDateTime = new Date(tzDateTimeValue);
    const now = new Date();

    const futureTime = (newDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (newTerminal.type === 'arrival' && futureTime > 0) {
      throwTimelineConflictError('Arrival time cannot be predicted in the future.');
    }

    if (newTerminal.type === 'departure' && futureTime > 2) {
      throwTimelineConflictError('Maximum allowed future departure time is 2 hours.');
    }

    const linkedTerminal = newLinkedTerminal || (existingTerminal && existingTerminal.linkedTerminal);
    const type = newTerminal.type || (existingTerminal && existingTerminal.type);

    if (linkedTerminal) {

      if (type) {
        const departureDate = type === 'departure' ? newDateTime : linkedTerminal.createdAt;
        const arrivalDate = type === 'arrival' ? newDateTime : linkedTerminal.createdAt;
        if (new Date(departureDate).getTime() >= (new Date(arrivalDate)).getTime()) {
          throwTimelineConflictError('Departure cannot be later than arrival.');
        }


        const terminalsBetween = await terminalRepository.getTerminalsBetween(departureDate, arrivalDate, userId, existingTerminal, linkedTerminal);
        if (terminalsBetween.length > 0) {
          throwTimelineConflictError('Overlapping connections. Other departures and/or arrivals fall in specified time range.');
        }
      }

    }

    if (type === 'departure') {
      const departureBefore = await terminalRepository.getDepartureBefore(newDateTime, userId);
      if (departureBefore && !(existingTerminal && existingTerminal.id === departureBefore.id)) throwTimelineConflictError('Overlapping departure. Cannot save departure immediately after another departure.');
    }

    if (type === 'arrival') {
      const departureAfter = await terminalRepository.getArrivalAfter(newDateTime, userId);
      if (departureAfter && !(existingTerminal && existingTerminal.id === departureAfter.id)) throwTimelineConflictError('Overlapping arrival. Cannot save arrival immediately before another arrival.');
    }

    newTerminal.createdAt = tzDateTimeValue;
    newTerminal.updatedAt = tzDateTimeValue;
  }

  if (newTerminal.priceType === 'part') {
    newTerminal.priceTerminalUuid = terminalInput.priceTerminalUuid;
    newTerminal.priceAmount = null;
    newTerminal.priceCurrency = null;
  } else {
    newTerminal.priceTerminalUuid = null;
  }

  const savedTerminal = await terminalRepository.saveTerminal(newTerminal);

  const checkInTimeSeconds = new Date(checkIn.createdAt).getSeconds();
  const savedTerminalCreatedTime = new Date(savedTerminal.createdAt).getTime();
  const savedTerminalTimeWithSeconds = new Date(savedTerminalCreatedTime + (checkInTimeSeconds * 1000));

  if (savedTerminal.type === 'arrival') {
    await checkInRepository.saveCheckIn({ id: checkIn.id, createdAt: savedTerminalTimeWithSeconds });
  }

  if (savedTerminal.type === 'departure' && (new Date(savedTerminal.createdAt)).getTime() < (new Date(checkIn.createdAt)).getTime()) {
    await checkInRepository.saveCheckIn({ id: checkIn.id, departureId: savedTerminal.id, createdAt: savedTerminalTimeWithSeconds });
  }

  if (newLinkedTerminal) {
    const linkedTerminalUpdate = copyNonNull(terminalInput, {}, [ 'transport', 'transportId', 'priceAmount', 'priceCurrency' ]);
    await terminalRepository.saveTerminal({
      uuid: newLinkedTerminal.uuid,
      linkedTerminalId: savedTerminal.id,
      linkedLocalityUuid: savedTerminal.localityUuid,
      linkedLocality: savedTerminal.locality,
      linkedLocalityLong: savedTerminal.localityLong,
      linkedFormattedAddress: savedTerminal.formattedAddress,
      ...linkedTerminalUpdate
    });
  }

  if (savedTerminal.linkedTerminalId) {
    const departure = savedTerminal.type === 'departure' ?
      await terminalRepository.getTerminal({ id: savedTerminal.id }) :
      await terminalRepository.getTerminal({ id: savedTerminal.linkedTerminalId });
    await adjustConnection(departure);
    const linkedTerminalUpdate = copyNonNull(terminalInput, {}, [ 'transport', 'transportId', 'priceAmount', 'priceCurrency' ]);
    if (Object.keys(linkedTerminalUpdate).length > 0) {
      await terminalRepository.saveTerminal({
        id: savedTerminal.linkedTerminalId,
        ...linkedTerminalUpdate
      });
    }
  }

  const localDateTime = getLocalDateTime(savedTerminal.createdAt, timeZone);
  log.info('localDateTime', localDateTime);
  log.info('utcDateTime', savedTerminal.createdAt);

  const priceTerminal = savedTerminal.priceTerminalUuid ? await terminalRepository.getTerminal({ uuid: savedTerminal.priceTerminalUuid }) : null;
  return {
    ...savedTerminal.toJSON(),
    priceTerminal: priceTerminal ? priceTerminal.toJSON() : null,
    localDateTime,
    utcDateTime: savedTerminal.createdAt
  };

};


const savePost = async (postInput, clientId, request) => {

  if (postInput.uuid) {
    const savedPost = await postRepository.getPost({ uuid: postInput.uuid });
    await requireOwnership(request, savedPost, clientId);
  }

  const { checkInUuid } = postInput;
  const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
  if (!checkIn) {
    throw new Error('Could not find Check In for Post');
  }

  const post = {
    checkInId: checkIn.id,
    text: postInput.text
  };

  copyNonNull(postInput, post, [ 'uuid', 'clientId' ]);
  await addUserId(post, request);

  let saved = await postRepository.savePost(post);

  if (postInput.tags) {
    for (let i = 0; i < postInput.tags.length; i++) {
      const tag = postInput.tags[i];
      await tagRepository.saveTag('Post', saved.id, tag, request.user.uuid);
    }
  }

  const { mediaItems } = postInput;
  if (mediaItems && mediaItems.length > 0) {
    for (let i = 0; i < mediaItems.length; i++) {
      const { thumbnail, type, url, uuid } = mediaItems[i];
      await postRepository.saveMediaItem({
        uuid, thumbnail, type, url,
        entityUuid: saved.uuid,
        entityType: 'Post'
      });
    }
  }


  saved = saved.toJSON();
  const savedMediaItems = await postRepository.getMediaItems({ entityUuid: saved.uuid });
  saved.mediaItems = savedMediaItems.map(mediaItem => mediaItem.toJSON());
  saved.checkInUuid = checkIn.uuid;

  return saved;

};

const deletePost = async (uuid, clientId, request) => {

  const post = await postRepository.getPost({ uuid });
  if (!post) {
    throw new Error('Post uuid=' + uuid + ' not found for deletion');
  }

  await requireOwnership(request, post, clientId);

  return await postRepository.deletePost(uuid);

};

const deleteTerminal = async (uuid, clientId, request) => {

  const terminal = await terminalRepository.getTerminal({ uuid });
  if (!terminal) {
    throw new Error('Terminal uuid=' + uuid + ' not found for deletion');
  }

  if (clientId || request) {
    await requireOwnership(request, terminal, clientId);
  }

  if (terminal.linkedTerminalId) {
    const linkedTerminal = await terminalRepository.getTerminal({ id: terminal.linkedTerminalId });
    const departure = terminal.type === 'departure' ? terminal : linkedTerminal;
    const arrival = terminal.type === 'arrival' ? terminal : linkedTerminal;
    await terminalRepository.deleteConnection({ sourceTerminalId: departure.id, targetTerminalId: arrival.id }, 'AND');
    if (terminal.type === 'departure') {
      await terminalRepository.deleteTerminal(linkedTerminal.uuid);
    } else {
      await terminalRepository.saveTerminal({
        uuid: linkedTerminal.uuid,
        linkedTerminalId: null,
        linkedLocality: null,
        linkedLocalityUuid: null,
        linkedFormattedAddress: null
      });
    }
  }

  const resetPriceTerminalCount = await terminalRepository.updateTerminals({ priceTerminalUuid: uuid }, { priceTerminalUuid: null });
  log.debug('RESET PRICE TERMINALS', resetPriceTerminalCount);

  return await terminalRepository.deleteTerminal(uuid);

};

const adjustLocalityAdminLevels = async (checkIn, localityUuid) => {

  const matchingLocalities = await localityRepository.getLocalities({ name: checkIn.locality });

  if (matchingLocalities.length > 0) {

    if (matchingLocalities.length === 1 && matchingLocalities[0].uuid === localityUuid) {
      return checkIn.locality;
    }

    const matchingCountryLocalities = await localityRepository.getLocalities({ name: checkIn.locality, country: checkIn.country });
    if (matchingCountryLocalities.length === 1 && matchingCountryLocalities[0].uuid === localityUuid) {
      // TODO: Set Terminal, CheckIn and EntityTag localityLong to country level
      await localityRepository.setAdminLevel(checkIn.locality, checkIn.country);
      await checkInRepository.setLocalityAdminLevel(checkIn.locality, checkIn.country);
      await terminalRepository.setLocalityAdminLevel(checkIn.locality, checkIn.country);
      return `${checkIn.locality}, ${checkIn.country}`;
    } else {
      const matchingAdmin1Localities = await localityRepository.getLocalities({ name: checkIn.locality, country: checkIn.country, adminArea1: checkIn.adminArea1 });
      if (matchingAdmin1Localities.length === 1 && matchingAdmin1Localities[0].uuid === localityUuid) {
        // TODO: Set Terminal, CheckIn and EntityTag localityLong to adnin area 1 level
        await localityRepository.setAdminLevel(checkIn.locality, checkIn.country, checkIn.adminArea1);
        await checkInRepository.setLocalityAdminLevel(checkIn.locality, checkIn.country, checkIn.adminArea1);
        await terminalRepository.setLocalityAdminLevel(checkIn.locality, checkIn.country, checkIn.adminArea1);
        return `${checkIn.locality}, ${checkIn.adminArea1}, ${checkIn.country}`;
      } else {
        // TODO: Set Terminal, CheckIn and EntityTag localityLong to adnin area 2 level
        await localityRepository.setAdminLevel(checkIn.locality, checkIn.country, checkIn.adminArea1, checkIn.adminArea2);
        await checkInRepository.setLocalityAdminLevel(checkIn.locality, checkIn.country, checkIn.adminArea1, checkIn.adminArea2);
        await terminalRepository.setLocalityAdminLevel(checkIn.locality, checkIn.country, checkIn.adminArea1, checkIn.adminArea2);
        return `${checkIn.locality}, ${checkIn.adminArea2}, ${checkIn.adminArea1}`;
      }

    }

  }

  return checkIn.locality;

};

const saveCheckIn = async (checkInInput, clientId, request) => {

  let existingCheckIn = null;
  if (checkInInput.uuid) {
    existingCheckIn = await postRepository.getCheckIn({ uuid: checkInInput.uuid });
  }

  const userId = await requireOwnership(request, existingCheckIn, clientId);

  const newCheckIn = copyNonNull(checkInInput, {}, [
    'uuid', 'clientId', 'latitude', 'longitude', 'placeId', 'locality', 'adminArea1', 'adminArea2', 'country', 'formattedAddress'
  ]);

  newCheckIn.locality = urlencode.decode(newCheckIn.locality);
  newCheckIn.adminArea1 = urlencode.decode(newCheckIn.adminArea1);
  newCheckIn.adminArea2 = urlencode.decode(newCheckIn.adminArea1);
  newCheckIn.country = urlencode.decode(newCheckIn.country);
  newCheckIn.formattedAddress = urlencode.decode(newCheckIn.formattedAddress);

  const latitude = newCheckIn.latitude || existingCheckIn.latitude;
  const longitude = newCheckIn.longitude || existingCheckIn.longitude;

  const timeZone = geoTz(latitude, longitude)[0];

  if (checkInInput.date) {

    const tzDateTime = moment.tz(checkInInput.date, timeZone);
    log.info('CHECKIN INPUT DATE', checkInInput.date);
    const tzDateTimeValue = tzDateTime.format();
    log.info('tzDateTimeValue', tzDateTimeValue);

    const newDateTime = new Date(tzDateTimeValue);
    const now = new Date();
    if (newDateTime.getTime() > now.getTime()) {
      throwTimelineConflictError('Check-ins in the future are not allowed as this has a potential to mess up your timeline.');
    }

    if (existingCheckIn) {

      const terminals = await terminalRepository.getTerminals({ checkInId: existingCheckIn.id });

      const arrival = terminals.find(terminal => terminal.type === 'arrival');
      const departure = terminals.find(terminal => terminal.type === 'departure');

      if (arrival) {
        if (new Date(arrival.createdAt).getTime() > newDateTime) {
          throwTimelineConflictError('Arrival check-in cannot be earlier than actual arrival.');
        }
      }

      if (departure) {
        if (new Date(departure.createdAt).getTime() < newDateTime) {
          throwTimelineConflictError('Departure check-in cannot be later than actual departure.');
        }
      }

      const lastDepartureCheckIn = await checkInRepository.getLastCheckInWithDeparture(newDateTime, userId);
      if (lastDepartureCheckIn && lastDepartureCheckIn.id !== existingCheckIn.id) {
        const lastCheckInDeparture = await terminalRepository.getTerminal({ checkInId: lastDepartureCheckIn.id });
        if (new Date(lastCheckInDeparture.createdAt).getTime() > newDateTime.getTime()) {
          throwTimelineConflictError('Cannot move check-in between another check-in and departure');
        }
      }

    }

    newCheckIn.createdAt = tzDateTimeValue;
    newCheckIn.updatedAt = tzDateTimeValue;

  } else {

    if (!existingCheckIn) newCheckIn.createdAt = new Date();

  }

  if (!existingCheckIn) {
    newCheckIn.userId = userId;
  }

  let departureBeforeExisting = null;
  if (existingCheckIn) {
    departureBeforeExisting = await terminalRepository.getDepartureBefore(existingCheckIn.createdAt, userId, existingCheckIn);
  }

  let departureBeforeNew = null;
  if (newCheckIn.createdAt) {
    departureBeforeNew = await terminalRepository.getDepartureBefore(newCheckIn.createdAt, userId);
  }

  let savedCheckIn = null;

  if (!existingCheckIn) {

    const shortNameLocalities = await localityRepository.getLocalities({ name: newCheckIn.locality, country: newCheckIn.country, adminArea1: null, adminArea2: null });
    if (shortNameLocalities.length === 1) {
      const shortNameLocality = shortNameLocalities[0];
      await localityRepository.saveLocality({
        uuid: shortNameLocality.uuid,
        adminArea1: newCheckIn.adminArea1,
        adminArea2: newCheckIn.adminArea2,
        nameLong: newCheckIn.locality
      });
    }

    const matchingAdmin2Localities = await localityRepository.getLocalities({ name: newCheckIn.locality, country: newCheckIn.country, adminArea1: newCheckIn.adminArea1, adminArea2: newCheckIn.adminArea2 });

    if (matchingAdmin2Localities.length === 0) {

      log.debug(`create-locality name=${newCheckIn.locality} country=${newCheckIn.country} latitude=${newCheckIn.latitude} longitude=${newCheckIn.longitude}`);
      const savedLocality = await localityRepository.saveLocality({
        name: newCheckIn.locality,
        nameLong: newCheckIn.locality,
        latitude: newCheckIn.latitude,
        longitude: newCheckIn.longitude,
        adminArea1: newCheckIn.adminArea1,
        adminArea2: newCheckIn.adminArea2,
        country: newCheckIn.country
      });

      const localityLong = await adjustLocalityAdminLevels(newCheckIn, savedLocality.uuid);
      newCheckIn.localityUuid = savedLocality.uuid;
      newCheckIn.localityLong = localityLong;
      savedCheckIn = await postRepository.saveCheckIn(newCheckIn);

    } else {
      newCheckIn.localityUuid = matchingAdmin2Localities[0].uuid;
      newCheckIn.localityLong = matchingAdmin2Localities[0].nameLong;
      savedCheckIn = await postRepository.saveCheckIn(newCheckIn);
    }
  } else {
    savedCheckIn = await postRepository.saveCheckIn(newCheckIn);
  }


  if (departureBeforeExisting && departureBeforeExisting.linkedTerminal) await adjustConnection(departureBeforeExisting);
  if (departureBeforeNew && departureBeforeNew.linkedTerminal) await adjustConnection(departureBeforeNew);

  if (checkInInput.tags) {
    const checkInTags = await tagRepository.getTagsByCheckInIds([savedCheckIn.id]);
    const deletedEntityTags = checkInTags.filter(tag => checkInInput.tags.indexOf(tag.tag) === -1);
    await tagRepository.deleteEntityTags({ id: deletedEntityTags.map(tag => tag.entityTagId) });
  }

  const localDateTime = getLocalDateTime(savedCheckIn.createdAt, timeZone);

  return {
    ...savedCheckIn.toJSON(),
    tags: (await tagRepository.getTagsByCheckInIds([savedCheckIn.id])).map(tag => tag.tag),
    date: localDateTime
  };

};

const deleteCheckIn = async (checkInUuid, clientId, request) => {

  const checkIn = await postRepository.getCheckIn({ uuid: checkInUuid });
  await requireOwnership(request, checkIn, clientId);

  const inboundCheckIns = await postRepository.getCheckIns({
    userId: checkIn.userId,
    createdAt: { $lt: checkIn.createdAt }
  }, {
    limit: 1,
    order: [[ 'createdAt', 'DESC' ]]
  });
  const outboundCheckIns = await postRepository.getCheckIns({
    userId: checkIn.userId,
    createdAt: { $gt: checkIn.createdAt }
  }, {
    limit: 1,
    order: [[ 'createdAt', 'ASC' ]]
  });

  const trip = await tripRepository.getTripByCheckInId(checkIn.id);
  if (trip) {
    if (trip.firstCheckInId === checkIn.id) {
      await tripRepository.deleteTrip({ id: trip.id });
    } else if (trip.lastCheckInId === checkIn.id) {
      await tripRepository.saveTrip({ id: trip.id, lastCheckInId: null });
    }
  }

  const departureBefore = await terminalRepository.getDepartureBefore(checkIn);

  await postRepository.deletePosts({ checkInId: checkIn.id });
  const terminals = await terminalRepository.getTerminals({ checkInId: checkIn.id });
  for (let i = 0; i < terminals.length; i++) {
    await deleteTerminal(terminals[i].uuid);
  }

  await postRepository.deleteCheckIns({ uuid: checkIn.uuid });
  if (departureBefore) await adjustConnection(departureBefore);

  const checkInsWithSameLocality = await checkInRepository.getCheckIns({ localityUuid: checkIn.localityUuid });
  if (checkInsWithSameLocality.length === 0) {
    await localityRepository.deleteLocalities({ uuid: checkIn.localityUuid });
  }

  let nextUrl = '/';
  if (outboundCheckIns.length > 0) nextUrl = `/check-in/${outboundCheckIns[0].uuid}`;
  else if (inboundCheckIns.length > 0) nextUrl = `/check-in/${inboundCheckIns[0].uuid}`;
  return {
    ...checkIn.toJSON(),
    nextUrl
  };

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

  if (inboundCheckIns.length > 0) {
    inboundCheckIns[0] = inboundCheckIns[0].get();
    inboundCheckIns[0].tags = (await tagRepository.getTagsByCheckInIds([inboundCheckIns[0].id])).map(tag => tag.tag);
  }

  return {
    inbound: inboundCheckIns,
    outbound: outboundCheckIns.map(checkIn => checkIn.toJSON())
  };

};

const getExifData = (path) => {
  const buffer = fs.readFileSync(path);
  const tags = ExifReader.load(buffer, { expanded: true });
  return tags;
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

    const readableStream = fs.createReadStream(inputFile);

    const pipeline = sharp()
      .rotate()
      .resize(600, null)
      .toBuffer((err, outputBuffer, info) => {

        if (err) {
          log.error('error processing image', err, info);
          fs.renameSync(inputFile, outputFile);
          return resolve();
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

    const upload = await uploadVideo(outputFile, mediaItemUuid);
    log.info(`video-upload-complete video-id=${upload.id}`);

    await postRepository.saveMediaItem({
      uuid: mediaItemUuid,
      url: upload.url,
      hosting: 'vimeo',
      thumbnail: upload.thumbnail,
      // thumbnail: upload.snippet.thumbnails.medium.url,
      uploadStatus: 'uploaded'
    });

  } catch (err) {
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

  deletePost: {

    type: PostType,
    description: 'Delete a post',
    args: {
      uuid: { type: GraphQLString },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid, clientId }) => {

      log.info(graphLog(request, 'delete-post', 'clientId=' + clientId + ' uuid=' + uuid));

      let deletedPost = (await deletePost(uuid, clientId, request));

      const checkIn = await checkInRepository.getCheckIn({ id: deletedPost.checkInId });
      deletedPost = {
        uuid: deletedPost.uuid,
        checkInUuid: checkIn.uuid
      };

      return deletedPost;

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

  deleteTerminal: {

    type: TerminalType,
    description: 'Delete a terminal',
    args: {
      uuid: { type: GraphQLString },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid, clientId }) => {

      log.info(graphLog(request, 'delete-terminal', 'clientId=' + clientId + ' uuid=' + uuid));

      let deletedTerminal = (await deleteTerminal(uuid, clientId, request));

      const checkIn = await checkInRepository.getCheckIn({ id: deletedTerminal.checkInId });
      deletedTerminal = {
        uuid: deletedTerminal.uuid,
        checkInUuid: checkIn.uuid
      };

      return deletedTerminal;

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

      console.log('uploading file', new Date(), file);

      let entity = null;
      let entityUuid = null;
      let mediaDir = null;
      if (mediaItem.entityType === 'CheckIn') {
        entity = await postRepository.getCheckIn({ uuid: mediaItem.entityUuid });
        entityUuid = entity.uuid;
        mediaDir = 'instance-media';
      } else if (mediaItem.entityType === 'Avatar' || mediaItem.entityType === 'AvatarSource') {
        mediaDir = 'users';
        entityUuid = mediaItem.entityUuid;
      } else {
        throw new Error(`Invalid entity type: ` + mediaItem.entityType);
      }

      const nameParts = file.originalname.split('.');
      const extension = nameParts[nameParts.length - 1];
      const savePath = STORAGE_PATH || path.join(__dirname, 'public');
      const filePath = path.join(savePath, file.filename);

      const mediaPath = path.join((MEDIA_PATH || path.join(__dirname, 'public')), mediaDir);
      const entityPath = path.join(mediaPath, entityUuid);

      if (fs.existsSync(filePath)) {

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath);
        }

        if (!fs.existsSync(entityPath)) {
          fs.mkdirSync(entityPath);
        }

        const now = (new Date()).getTime();
        let entityFileName = null;

        if (mediaItem.entityType === 'CheckIn') {
          entityFileName = `${now}.${extension}`;
          console.log('SAVE FILE TO', entityFileName);
        } else if (mediaItem.entityType === 'AvatarSource') {
          entityFileName = `avatar-source.${extension}`;
        } else if (mediaItem.entityType === 'Avatar') {
          entityFileName = `avatar.${extension}`;
        }

        const entityFilePath = path.join(entityPath, entityFileName);

        let savedMediaItem = null;
        console.log('file mimetype', file.mimetype);
        if (file.mimetype.indexOf('image') !== -1) {

          log.info(`graphql-request=upload-instance-file user=${request.user ? request.user.uuid : null} image-file-name=${entityFileName}`);

          const additionalFields = {};

          const exif = getExifData(filePath);
          console.log('exif data for file', exif);

          if (exif) {

            if (mediaItem.entityType === 'CheckIn' && exif.gps) {
              log.info('adding exif data', exif.exif.GPSTimeStamp, exif.exif.DateTime);
              if (exif.exif) {
                let dateTime = exif.exif.DateTimeOriginal || exif.exif.DateTime;
                let timeZone = geoTz(exif.gps.Latitude, exif.gps.Longitude);
                if (dateTime.value && dateTime.value.length > 0 && timeZone.length > 0) {
                  dateTime = dateTime.value[0].split(' ');
                  if (dateTime.length === 2) {
                    console.log(dateTime[0]);
                    dateTime = dateTime[0].split(':')
                      .join('-') + ' ' + dateTime[1];
                    timeZone = timeZone[0];
                    const tzDateTime = moment.tz(dateTime, timeZone);
                    const tzDateTimeValue = tzDateTime.format();
                    additionalFields.date = new Date(tzDateTimeValue);
                  }
                }
              }
              if (!additionalFields.date) {
                log.info('Failed to parse date from EXIF', exif.exif);
              }
              additionalFields.latitude = exif.gps.Latitude;
              additionalFields.longitude = exif.gps.Longitude;
              additionalFields.altitude = exif.gps.Altitude;

            } else if (mediaItem.entityType === 'User') {
              // TODO: Get exif data for avatars?
            }

          }

          await processImage(filePath, entityFilePath);

          const mediaUrl = `/${mediaDir}/${entityUuid}/${entityFileName}`;
          if (mediaItem.entityType === 'Avatar') {
            await userRepository.update(mediaItem.entityUuid, { avatar: mediaUrl });
          } else if (mediaItem.entityType === 'AvatarSource') {
            await userRepository.update(mediaItem.entityUuid, { avatarSource: mediaUrl });
          }

          savedMediaItem = await postRepository.saveMediaItem({
            entityUuid,
            type: 'image',
            flag: false,
            url: mediaUrl,
            uploadStatus: 'uploaded',
            uploadProgress: 100,
            ...additionalFields
          });

        } else {

          log.info(`graphql-request=upload-instance-file-video user=${request.user ? request.user.uuid : null}`);

          console.log('SAVE AS', entityUuid);
          savedMediaItem = await postRepository.saveMediaItem({
            entityUuid,
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
      await postRepository.deleteMediaItems({ uuid: mediaItem.uuid });
      if (mediaItem.type === 'video') {
        await deleteVideo(mediaItem.url);
      } else {
        fs.unlinkSync(filePath);
      }

      return mediaItem.toJSON();
    }

  },

};

export const getFeedItem = async (request, checkIn) => {

  const posts = await postRepository.getPosts({ checkInId: checkIn.id });

  log.info(graphLog(request, 'get-feed-item', 'check-in=' + checkIn.uuid + ' posts=' + posts.length));
  const linkedCheckIns = await getLinkedCheckIns(checkIn, request);
  const terminals = await terminalRepository.getTerminals({ checkInId: checkIn.id });
  const credentials = await getEntityCredentials(request, checkIn);

  const tagIds = (await tagRepository.getEntityTags({ checkInId: checkIn.id }))
    .map(entityTag => entityTag.tagId);

  let checkInLikedByUser = false;

  let userId = null;
  const user = await userRepository.getUser({ id: checkIn.userId });
  if (user) {
    userId = await user.id;
  }

  if (userId) {
    const checkInUserLikes = await commentRepository.countLikes({ userId, entityId: checkIn.id, entityType: 'CheckIn' });
    checkInLikedByUser = checkInUserLikes > 0;
  }

  const getComments = async (query) => {

    const comments = (await commentRepository.getComments(query))
      .map(async comment => {

        let commentLikedByUser = false;
        if (userId) {
          const commentUserLikes = await commentRepository.countLikes({ userId, entityId: comment.id, entityType: 'Comment' });
          commentLikedByUser = commentUserLikes > 0;
        }

        return {
          ...comment.get(),
          checkInUuid: checkIn.uuid,
          likes: await commentRepository.countLikes({ entityId: comment.id, entityType: 'Comment' }),
          likedByUser: commentLikedByUser
        };
      });

    return comments;

  };

  const timeZone = geoTz(checkIn.latitude, checkIn.longitude)[0];

  let departure = null;
  if (checkIn.departureId) {
    departure = await terminalRepository.getTerminal(checkIn.departureId);
  } else {
    departure = await terminalRepository.getDepartureBefore(checkIn);
  }

  let trip = null;
  const lastStartedTrip = await tripRepository.getLastStartedTrip(checkIn.userId, checkIn.createdAt);
  if (lastStartedTrip && lastStartedTrip.lastCheckInId) {
    const lastTripCheckIn = await checkInRepository.getCheckIn({ id: lastStartedTrip.lastCheckInId });
    if (lastTripCheckIn.createdAt.getTime() > checkIn.createdAt.getTime()) {
      trip = lastStartedTrip;
    }
  } else {
    trip = lastStartedTrip;
  }

  if (!trip) {
    trip = await tripRepository.getTripByCheckInId(checkIn.id);
  }

  if (trip) {
    trip = trip.toJSON();
    if (trip.firstCheckInId) trip.firstCheckIn = (await checkInRepository.getCheckIn({ id: trip.firstCheckInId })).toJSON();
    if (trip.lastCheckInId) trip.lastCheckIn = (await checkInRepository.getCheckIn({ id: trip.lastCheckInId })).toJSON();
  }


  return {
    userAccess: credentials.userAccess,
    checkIn: {
      ...(checkIn.toJSON()),
      departure: departure ? {
        ...departure.toJSON(),
        localDateTime: getLocalDateTime(departure.createdAt, geoTz(departure.latitude, departure.longitude)[0])
      } : null,
      user: user ? {
        uuid: user.uuid,
        photo: user.photo,
        avatar: user.avatar,
        avatarSource: user.avatarSource,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      } : null,
      userImage: credentials.userImage,
      userUuid: credentials.userUuid,
      date: getLocalDateTime(checkIn.createdAt, timeZone),
      tags: (await tagRepository.getTags({ id: tagIds })).map(tag => tag.value),
      comments: await getComments({ checkInId: checkIn.id }),
      likes: await commentRepository.countLikes({ entityId: checkIn.id, entityType: 'CheckIn' }),
      likedByUser: checkInLikedByUser,
      trip,
    },
    ...linkedCheckIns,
    posts: posts.map(async (post) => {
      const mediaItems = await postRepository.getMediaItems({ entityUuid: post.uuid });
      return {
        ...post.toJSON(),
        user: credentials.ownerFullName,
        mediaItems: mediaItems.map(mediaItem => mediaItem.toJSON())
      };
    }),
    terminals: terminals.map(async (terminal) => {
      let linkedTerminal = null;
      if (terminal.linkedTerminalId) {
        linkedTerminal = await terminalRepository.getTerminal({ id: terminal.linkedTerminalId });
        const linkedTerminalCheckIn = await postRepository.getCheckIn({ id: linkedTerminal.checkInId });
        linkedTerminal = {
          ...linkedTerminal.toJSON(),
          localDateTime: getLocalDateTime(linkedTerminal.createdAt, timeZone),
          utcDateTime: linkedTerminal.createdAt
        };
        linkedTerminal.checkIn = {
          ...linkedTerminalCheckIn.toJSON(),
          date: getLocalDateTime(linkedTerminalCheckIn.createdAt, timeZone)
        };
      }


      const priceTerminal = terminal.priceTerminalUuid ? await terminalRepository.getTerminal({ uuid: terminal.priceTerminalUuid }) : null;

      const terminalId = terminal.id;
      return {
        ...terminal.toJSON(),
        priceTerminal: priceTerminal ? priceTerminal.toJSON() : null,
        localDateTime: getLocalDateTime(terminal.createdAt, timeZone),
        utcDateTime: terminal.createdAt,
        comments: await getComments({ terminalId }),
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

  terminal: {

    type: TerminalType,
    description: 'Find a terminal by uuid',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {

      log.info(graphLog(request, 'find-terminal-by-uuid','uuid=${uuid}'));
      const terminal = await terminalRepository.getTerminal({ uuid });
      if (!terminal) {
        throw new Error(`Terminal (uuid ${uuid}) not found`);
      }

      return { ...terminal.toJSON() };

    }

  },

  feed: {

    type: FeedType,
    description: 'Query feed',
    args: {
      clientId: { type: GraphQLString },
      tags: { type: GraphQLString },
      locality: { type: GraphQLString },
      country: { type: GraphQLString },
      linkedLocality: { type: GraphQLString },
      from: { type: GraphQLString },
      to: { type: GraphQLString },
      route: { type: GraphQLInt },
      user: { type: GraphQLString },
      trip: { type: GraphQLString },
      transportTypes: { type: new GraphQLList(GraphQLString) },
      offset: { type: GraphQLInt },
      limit: { type: GraphQLInt }
    },
    resolve: async ({ request }, { clientId, trip, tags, locality, country, linkedLocality, from, to, route, user, transportTypes, offset, limit }) => {

      log.info(graphLog(request, 'get-feed', `locality=${locality} country=${country}`));

      let checkIns = [];

      const options = {};

      if (user || locality || country || tags) {
        options.order = [['createdAt', 'DESC']];
      } else if (trip) {
        options.order = [['createdAt', 'ASC']];
      } else {
        options.order = [['id', 'DESC']];
      }

      if (offset) options.offset = offset;
      if (limit) options.limit = limit;

      let userId = null;
      if (user) {
        userId = await userRepository.getUserIdByUuid(user);
      }

      let localityName = null;
      if (locality) {
        const localityEntity = await localityRepository.getLocality({ uuid: locality });
        if (localityEntity) localityName = localityEntity.nameLong;
      }

      let linkedLocalityName = null;
      if (linkedLocality) {
        const localityEntity = await localityRepository.getLocality({ uuid: linkedLocality });
        if (localityEntity) linkedLocalityName = localityEntity.nameLong;
      }

      let tripName = null;
      let fromName = null;
      let toName = null;
      if (from && to) {

        const routeSearchParams = {};
        if (transportTypes && transportTypes.length > 0) {
          routeSearchParams.transportTypes = transportTypes;
        }

        const routes = await terminalRepository.getRoute(from, to, routeSearchParams);
        let routeKeys = Object.keys(routes);
        if (route) routeKeys = routeKeys.filter(key => parseInt(key) === route);

        let checkInIds = [];
        for (let i = 0; i < routeKeys.length; i++) {
          const terminals = routes[routeKeys[i]].filter(terminal => terminal.linkedTerminalId);
          await findRoutePoints(terminals);
          checkInIds = terminals.flatMap((terminal, index) => (
            ([terminal.checkInId]
              .concat(terminal.routeCheckIns.map(checkIn => checkIn.id)))
              .concat([terminal.linkedTerminal.checkInId])
          ));
          checkInIds = checkInIds.filter((id, index, self) => self.indexOf(id) === index);
        }

        let queryCheckInIds = checkInIds;
        if (options.offset) {
          queryCheckInIds = [];
          let limit = options.limit ? offset + options.limit : checkInIds.length;
          if (limit > checkInIds.length) limit = checkInIds.length;
          for (let i = offset; i < checkInIds.length; i++) {
            queryCheckInIds.push(checkInIds[i]);
          }
        }

        const routeCheckIns = await checkInRepository.getCheckIns({ id: checkInIds });
        checkIns = queryCheckInIds.map(id => routeCheckIns.find(checkIn => checkIn.id === id));

        const fromLocality = await localityRepository.getLocality({ uuid: from });
        fromName = fromLocality.nameLong;
        const toLocality = await localityRepository.getLocality({ uuid: to });
        toName = toLocality.nameLong;

      } else if (tags) {
        const tagsArray = tags.split(',');
        const query = { tags: tagsArray, userId };
        checkIns = await postRepository.getTaggedCheckIns(query, options);
      } else if (trip) {
        const tripEntity = uuidValidate(trip) ?
          await tripRepository.getTrip({ uuid: trip }) :
          await tripRepository.getTrip({ name: trip });
        if (tripEntity) {
          tripName = tripEntity.name;
          userId = tripEntity.userId;
          checkIns = await checkInRepository.getTripCheckIns(tripEntity.id, !tripEntity.lastCheckInId, options);
        }
      } else if (country) {
        const query = { country };
        if (userId) query.userId = userId;
        checkIns = await checkInRepository.getFeedCheckIns(query, options);
      } else if (locality && linkedLocality) {
        const terminals = await terminalRepository.getInterTerminalsByLocality(locality, { linkedLocalityUuid: linkedLocality }, options);
        checkIns = terminals.map(terminal => terminal.checkIn);
      } else {
        const query = {};
        if (locality) query.localityUuid = locality;
        if (userId) query.userId = userId;
        checkIns = await checkInRepository.getFeedCheckIns(query, options);
      }

      // console.log('returning checkins', checkIns);
      const openTerminalParams = { linkedTerminalId: null };

      if (request.user) {
        const requestUserId = await userRepository.getUserIdByUuid(request.user.uuid);
        openTerminalParams.userId = requestUserId;
      } else if (clientId) {
        openTerminalParams.clientId = clientId;
      }

      const openTerminals = await terminalRepository.getTerminals(openTerminalParams);
      log.info(graphLog(request, 'get-feed', 'check-ins=' + checkIns.length));

      let userName = null;
      let userImage = null;
      let userData = null;
      if (userId) {
        const userById = await userRepository.getById(userId);
        if (userById) {
          userData = userById.toJSON();
          userName = userById.firstName + ' ' + userById.lastName;
          userImage = userById.photo;
        }
      }

      return {
        feedItems: checkIns.map(async (checkIn) => {
          return await getFeedItem(request, checkIn);
        }),
        openTerminals: openTerminals.map(async (terminal) => {
          const terminalCheckIn = await postRepository.getCheckIn({ id: terminal.checkInId });
          const timeZone = geoTz(terminalCheckIn.latitude, terminalCheckIn.longitude)[0];
          terminalCheckIn.date = getLocalDateTime(terminalCheckIn.createdAt, timeZone);
          return {
            ...terminal.toJSON(),
            localDateTime: getLocalDateTime(terminal.createdAt, timeZone),
            utcDateTime: terminal.createdAt,
            checkIn: terminalCheckIn
          };
        }),
        user: userData,
        locality: localityName,
        linkedLocality: linkedLocalityName,
        userImage,
        tripName,
        from: fromName,
        to: toName
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

      const openTerminals = await terminalRepository.getTerminals(openTerminalParams);

      const result = openTerminals.map(async (terminal) => {
        const terminalCheckIn = await postRepository.getCheckIn({ id: terminal.checkInId });
        const timeZone = geoTz(terminalCheckIn.latitude, terminalCheckIn.longitude)[0];
        terminalCheckIn.date = getLocalDateTime(terminalCheckIn.createdAt, timeZone);
        return {
          ...terminal.toJSON(),
          localDateTime: getLocalDateTime(terminal.createdAt, timeZone),
          utcDateTime: terminal.createdAt,
          checkIn: terminalCheckIn.toJSON()
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

      return mediaItem.toJSON();

    }

  }


};
