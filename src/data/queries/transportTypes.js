import { GraphQLList, GraphQLString } from 'graphql';
import TransportTypeType from '../types/TransportTypeType';
import { linkRepository } from '../source';

export default {

  type: new GraphQLList(TransportTypeType),
  description: 'List of available transport type options', 
  resolve: async ({ request }, { input }) => {
    return await linkRepository.getTransportTypes();
  }

};

