import { GraphQLList, GraphQLString } from 'graphql';
import { UserType, UserInputType } from '../types/UserType';
import { userRepository } from '../source';

export const UserQueryFields = {

  user: {
  
    type: new GraphQLList(UserType),
    description: 'Transitlinks user', 
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {
      const user = await userRepository.getByUuid(uuid);
      return { uuid: user.uuid, email: user.email };
    }

  }

};

export const UserMutationFields = {
  
  user: {
    
    type: UserType,
    description: 'Update a user',
    args: {
      values: { type: UserInputType }
    },
    resolve: async ({ request }, { values }) => {
      const uuid = values.uuid;
      delete values.uuid;
      const user = await userRepository.update(uuid, values);
      return user;
    }
  
  }

};
