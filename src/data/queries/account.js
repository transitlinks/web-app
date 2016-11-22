import { GraphQLString, GraphQLInt } from 'graphql';
import ProfileType from '../types/ProfileType';
import UserLinksType from '../types/UserLinksType';

export const AccountQueryFields = {
  
  profile: {
    
    type: ProfileType,
    description: 'Basic user info', 
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async (root, { uuid }) => {
      return {
        uuid,
        email: 'test@test.com',
        photo: 'abc.jpg'
      };
    }

  },
  
  links: {
    
    type: UserLinksType,
    description: 'User links and stats', 
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async (root, { uuid }) => {
      return {
        uuid,
        links: [
          { from: 'Alabama, USA', to: 'Wisconsin, USA', transport: 'bus' }
        ]
      };
    }

  }

};
