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
    const country = details.address_components.filter(
      component => component.types.includes("country")
    );
   
    let countryLong = null;
    let countryShort = null;
    if (country.length > 0) {
      countryLong = country[0].long_name;
      countryShort = country[0].short_name;
    }

    locality = { 
      apiId,
      name: details.name,
      countryLong,
      countryShort,
      description: details.formatted_address, 
      lat, lng 
    };
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
      departureDate, departureHour, departureMinute, departurePlace,
      arrivalDate, arrivalHour, arrivalMinute, arrivalPlace,
      priceAmount, priceCurrency,
      description,
      availabilityRating, departureRating, arrivalRating, awesomeRating
    } = linkInstance;
     
    departureDate = departureDate ? new Date(departureDate) : null;   
    arrivalDate = arrivalDate ? new Date(arrivalDate) : null;

		linkInstance = await linkRepository.createInstance({ 
			linkId: link.id,
			transportId: transport.id,
      departureDate, departureHour, departureMinute, departurePlace,
      arrivalDate, arrivalHour, arrivalMinute, arrivalPlace,
      priceAmount, priceCurrency,
      description
    });

    const ratings = [];
    if (availabilityRating) {
      ratings.push({
        property: 'availability',
        rating: availabilityRating
      });
    }

    if (departureRating) {
      ratings.push({
        property: 'departure',
        rating: departureRating
      });
    }
    
    if (arrivalRating) {
      ratings.push({ 
        property: 'arrival',
        rating: arrivalRating
      });
    }

    if (awesomeRating) {
      ratings.push({
        property: 'awesome',
        rating: awesomeRating
      });
    }
    
    await linkRepository.saveInstanceRatings(linkInstance.id, ratings);

    return linkInstance;
			
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
  
  linkSearch: {
    
    type: new GraphQLList(TransitLinkType),
    description: 'Find links by localities',
    args: {
      input: { type: GraphQLString }
    },
    resolve: async ({ request }, { input }) => {
      return linkRepository.getByLocalityName(input); 
    }

  },

  links: {
    
    type: new GraphQLList(TransitLinkType),
    description: 'Get full links data by localities',
    args: {
      input: { type: GraphQLString }
    },
    resolve: async ({ request }, { input }) => {
      return linkRepository.getByLocalityName(input); 
    }
  
  }

};
