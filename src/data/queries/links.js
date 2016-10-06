import { getLog } from '../../core/log';
const log = getLog('data/queries/links');

import { 
  localityRepository, 
  linkRepository, 
  placesApi 
} from '../source';

import { 
	TransitLinkType, 
	TransitLinkInputType,
	LinkInstanceType, 
	LinkInstanceInputType, 
} from '../types/TransitLinkType';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

const getOrCreateLocality = async (apiId) => {
  
  let locality = await localityRepository.getByApiId(apiId); 

  if (!locality) {
    
    const details = await placesApi.getDetails(apiId);
    const { lat, lng } = details.geometry.location;
    locality = { apiId, name: details.formatted_address, lat, lng };
    locality = await localityRepository.create(locality);
  
  }

  return locality;

};

const createOrUpdateLink = async (linkInstance) => {
 	
  if (!linkInstance.id) { // Create new link
    
    const from = await getOrCreateLocality(linkInstance.from);
    const to = await getOrCreateLocality(linkInstance.to);
    
    if (!from || !to) {
      throw new Error('Cannot create link: invalid place id');
    }
		
		let link = await linkRepository.getByEndpoints(from.id, to.id); 
    
		if (!link) {
			link = await linkRepository.create({ fromId: from.id, toId: to.id });
		}
		
		const transport = await linkRepository.getTransportBySlug(linkInstance.transport);
	  
    let {
      departureDate, departureHour, departureMinute,
      arrivalDate, arrivalHour, arrivalMinute
    } = linkInstance;
    
    departureDate = departureDate ? new Date(departureDate) : null;   
    arrivalDate = arrivalDate ? new Date(arrivalDate) : null;

		return await linkRepository.createInstance({ 
			linkId: link.id,
			transportId: transport.id,
      departureDate, departureHour, departureMinute,
      arrivalDate, arrivalHour, arrivalMinute
		});
			
  } else { // Update existing link
    return await linkRepository.update(link);
  }

};

export const TransitLinkMutationFields = {
  
  linkInstance: {
    
    type: LinkInstanceType,
    description: 'Create a new link instance',
    args: {
      linkInstance: { type: LinkInstanceInputType }
    },
    resolve: async ({ request }, { linkInstance }) => {
      return await createOrUpdateLink(linkInstance);
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
      
      const link = await linkRepository.getById(id);
      if (!link) {
        throw new Error(`Link (id ${id}) not found`);
      }

      return link;
    
    }
  
  },
  
	linkInstance: {
    
    type: LinkInstanceType,
    description: 'Find a link instance by id',
    args: {
      id: { type: GraphQLInt }
    },
    resolve: async ({ request }, { id }) => {
      
      const linkInstance = await linkRepository.getInstanceById(id);
      if (!linkInstance) {
        throw new Error(`Link instance (id ${id}) not found`);
      }

      return linkInstance;
    
    }
  
  },

  links: {
    
    type: new GraphQLList(TransitLinkType),
    description: 'Find links by localities',
    args: {
      input: { type: GraphQLString }
    },
    resolve: async ({ request }, { input }) => {
      return linkRepository.getByLocalityName(input); 
    }
  
  }

};
