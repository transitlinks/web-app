import { getLog } from '../../core/log';
const log = getLog('data/queries/links');

import localityRepo from '../source/localityRepository';
import linkRepo from '../source/linkRepository';
import placesApi from '../source/placesApi';

import { TransitLinkType, TransitLinkInputType } from '../types/TransitLinkType';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

const getOrCreateLocality = async (apiId) => {
  
  let locality = await localityRepo.getByApiId(apiId); 

  if (!locality) {
    
    const details = await placesApi.getDetails(apiId);
    const { lat, lng } = details.geometry.location;
    locality = { apiId, name: details.formatted_address, lat, lng };
    locality = await localityRepo.create(locality);
  
  }

  return locality;

};

const createOrUpdateLink = async (link) => {
  
  if (!link.id) { // Create new link
        
    const from = await getOrCreateLocality(link.from);
    const to = await getOrCreateLocality(link.to);
    
    if (!from || !to) {
      throw new Error('Cannot create link: invalid place id');
    }
 
    return await linkRepo.create({ fromId: from.id, toId: to.id });

  } else { // Update existing link
    return await linkRepo.update(link);
  }

};

export const TransitLinkMutationFields = {
  
  link: {
    
    type: TransitLinkType,
    description: 'Create a new link',
    args: {
      link: { type: TransitLinkInputType }
    },
    resolve: async ({ request }, { link }) => {
      return await createOrUpdateLink(link);
    }
  
  }

};

export const TransitLinkQueryFields = {
  
  link: {
    
    type: TransitLinkType,
    description: 'Find a link by id',
    args: {
      id: { type: GraphQLInt }
    },
    resolve: async ({ request }, { id }) => {
      
      const link = await linkRepo.getById(id);
      if (!link) {
        throw new Error(`Link (id ${id}) not found`);
      }

      return link;
    
    }
  
  },

  links: {
    
    type: new GraphQLList(TransitLinkType),
    description: 'Find links by localities',
    args: {
      localityId: { type: GraphQLInt }
    },
    resolve: async ({ request }, { localityId }) => {
      return linkRepo.getByLocalityId(localityId); 
    }
  
  }

};
