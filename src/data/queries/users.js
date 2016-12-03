import bcrypt from 'bcrypt-nodejs';
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
      uuid: { type: GraphQLString },
      values: { type: UserInputType }
    },
    resolve: async ({ request }, { uuid, values }) => {
      const { password } = values;
      if (password && password.length > 0) {
        values.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
      }
      const user = await userRepository.update(uuid, values);
      return user;
    }
  
  }

};
