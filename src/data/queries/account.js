import { GraphQLString, GraphQLInt } from 'graphql';
import ProfileType from '../types/ProfileType';
import UserLinksType from '../types/UserLinksType';

export const AccountQueryFields = {
  
  profile: {
    
    type: ProfileType,
    description: 'Basic user info', 
    args: {
      id: { type: GraphQLInt }
    },
    resolve: async (root, { id }) => {
      return {
        id,
        email: 'test@test.com',
        photo: 'abc.jpg'
      };
    }

  },
  
  links: {
    
    type: UserLinksType,
    description: 'User links and stats', 
    args: {
      id: { type: GraphQLInt }
    },
    resolve: async (root, { id }) => {
      return {
        id,
        links: [
          { from: 'Alabama, USA', to: 'Wisconsin, USA', transport: 'bus' }
        ]
      };
    }

  }

};
