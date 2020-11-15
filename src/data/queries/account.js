import { GraphQLString, GraphQLInt } from 'graphql';
import ProfileType from '../types/ProfileType';
import { userRepository, linkRepository } from '../source';
import { requireOwnership } from './utils';

export const AccountQueryFields = {

  profile: {

    type: ProfileType,
    description: 'Basic user info',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {
      requireOwnership(request, uuid);
      const user = await userRepository.getByUuid(uuid);
      return { uuid: user.uuid, email: user.email, username: user.username, photo: user.photo };
    }

  }

};
