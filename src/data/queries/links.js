import { getLog } from '../../core/log';
const log = getLog('data/queries/links');

import {
  createRatingsMap,
  calcInstanceRating,
  calcTransitDuration
} from '../../services/linkService';

import { 
  localityRepository, 
  linkRepository,
  userRepository,
  ratingRepository,
  placesApi
} from '../source';

import { 
	TransitLinkType, 
	TransitLinkInputType,
	LinkInstanceType, 
	LinkInstanceInputType, 
} from '../types/TransitLinkType';

import { VotesType } from '../types/VoteType';

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

const getLinkByInstance = async (linkInstance) => {
  
  const from = await getOrCreateLocality(linkInstance.from);
  const to = await getOrCreateLocality(linkInstance.to);

  if (!from || !to) {
    throw new Error('Cannot create link: invalid place id');
  }

  let link = await linkRepository.getByEndpoints(from.id, to.id); 

  if (!link) {
    link = await linkRepository.create({ fromId: from.id, toId: to.id });
  }

  return link;

};

const saveRating = async (userId, linkInstanceId, property, rating) => {
  if (rating) {
    await ratingRepository.saveRating({
      userId, linkInstanceId, property, rating
    });
  }
};

const createOrUpdateLink = async (linkInstance, reqUser) => {
 	
  if (!linkInstance.uuid) { // Create new link
    
    const link = await getLinkByInstance(linkInstance);
		const transport = await linkRepository.getTransportBySlug(linkInstance.transport);
	  
    let {
      departureDate, departureHour, departureMinute, departurePlace,
      arrivalDate, arrivalHour, arrivalMinute, arrivalPlace,
      priceAmount, priceCurrency,
      description,
      availabilityRating, departureRating, arrivalRating, awesomeRating
    } = linkInstance;

    let userId = null;
    if (reqUser) {
      const user = await userRepository.getByUuid(reqUser.uuid);
      userId = user.id;
    }
    
    linkInstance = await linkRepository.createInstance({
      userId, 
			linkId: link.id,
			transportId: transport.id,
      departureDate, departureHour, departureMinute, departurePlace,
      arrivalDate, arrivalHour, arrivalMinute, arrivalPlace,
      priceAmount, priceCurrency,
      description
    });
    
    if (userId) {
      
      saveRating(userId, linkInstance.id, 'availability', availabilityRating);
      saveRating(userId, linkInstance.id, 'departure', departureRating);
      saveRating(userId, linkInstance.id, 'arrival', arrivalRating);
      saveRating(userId, linkInstance.id, 'awesome', awesomeRating);
 
    }

    delete linkInstance.id;
    return linkInstance;
			
  } else { // Update existing link
    
    const link = await getLinkByInstance(linkInstance);
		const transport = await linkRepository.getTransportBySlug(linkInstance.transport);
    
    let {
      departureDate, departureHour, departureMinute, departurePlace,
      arrivalDate, arrivalHour, arrivalMinute, arrivalPlace,
      priceAmount, priceCurrency,
      description
    } = linkInstance;

    linkInstance = {
      uuid: linkInstance.uuid,
			linkId: link.id,
			transportId: transport.id,
      departureDate, departureHour, departureMinute, departurePlace,
      arrivalDate, arrivalHour, arrivalMinute, arrivalPlace,
      priceAmount, priceCurrency,
      description
    };
    
    return await linkRepository.updateInstance(linkInstance);
  
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
      log.info(`graphql-request=create-link-instance user=${request.user ? request.user.uuid : null} from=${linkInstance.from} to=${linkInstance.to} transport=${linkInstance.transport}`);
      return await createOrUpdateLink(linkInstance, request.user);
    }
  
  },
  
  votes: {
    
    type: VotesType,
    description: 'Cast a vote on link instance',
    args: {
      uuid: { type: GraphQLString },
      voteType: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid, voteType }) => {
      log.info(`graphql-request=save-vote user=${request.user ? request.user.uuid : null} uuid=${uuid} vote-type=${voteType}`);
      const votesCount = await linkRepository.saveVote(uuid, voteType);
      return {
        linkInstanceUuid: uuid,
        voteType,
        votesCount
      };
    }
  
  }

};

export const TransitLinkQueryFields = {
  
  link: {
    
    type: TransitLinkType,
    description: 'Find a link by id',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {
      
      const link = await linkRepository.getByUuid(uuid);
      if (!link) {
        throw new Error(`Link (uuid ${uuid}) not found`);
      }

      const avgRatings = await ratingRepository.getAverages(link.instances.map(instance => instance.id));
      const avgRatingsMap = createRatingsMap(avgRatings);
      link.instances.forEach(instance => { 
        Object.assign(instance, avgRatingsMap[instance.id]);
        instance.avgRating = calcInstanceRating(instance);
        instance.durationMinutes = calcTransitDuration(instance);
        delete instance.id;
      });
       
      return link;
    
    }
  
  },
  
	linkInstance: {
    
    type: LinkInstanceType,
    description: 'Find a link instance by uuid',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {
      
      log.info(`graphql-request=get-link-instance uuid=${uuid} user=${request.user ? request.user.uuid : null}`);
      
      const linkInstance = await linkRepository.getInstanceByUuid(uuid);
      if (!linkInstance) {
        throw new Error(`Link instance (uuid ${uuid}) not found`);
      }
      
      const avgRatings = await ratingRepository.getAverages([linkInstance.id]); 
      log.debug("avgRatings", avgRatings);
      const avgRatingsMap = createRatingsMap(avgRatings);
      log.debug("avgRatingsMap", avgRatingsMap);
      Object.assign(linkInstance, avgRatingsMap[linkInstance.id]);


      linkInstance.avgRating = calcInstanceRating(linkInstance);
      linkInstance.durationMinutes = calcTransitDuration(linkInstance);
      delete linkInstance.id;
      
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
