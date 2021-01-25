import { userRepository } from '../source';

export const throwMustBeLoggedInError = () => {
  throw Object.assign(new Error('Not logged in'), {
    extensions: {
      name: 'NotLoggedIn',
      text: 'Log in required.',
      statusCode: 401
    }
  });
};

export const throwUnauthorizedError = () => {
  throw Object.assign(new Error('Unauthorized access'), {
    extensions: {
      name: 'UnauthorizedAccess',
      text: 'The user does not have access to this resource.',
      statusCode: 403
    }
  });
};

export const throwTimelineConflictError = (text) => {
  throw Object.assign(new Error('Timeline conflict'), {
    extensions: {
      name: 'TimelineConflict',
      text: text ? ('Timeline Conflict: ' + text) : 'Timeline conflict.',
      statusCode: 409
    }
  });
};

export const requireOwnership = async (request, entity, clientId) => {

  let userId = null;

  const adminUser = await userRepository.getByEmail('vhalme@gmail.com');
  if (request.user) {
    userId = await userRepository.getUserIdByUuid(request.user.uuid);
    if (entity && adminUser.id !== userId && entity.userId !== userId) {
      throwUnauthorizedError();
    }
  } else if (!(entity && clientId && clientId === entity.clientId)) {
    throwMustBeLoggedInError();
  }

  return userId;

};
