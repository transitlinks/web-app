import { getLog } from '../../core/log';
const log = getLog('data/queries/ratings');

import {
  GraphQLInt, 
  GraphQLString,
  GraphQLList 
} from 'graphql';
import { RatingType, LinkInstanceRatingsType, RatingInputType } from '../types/RatingType';
import { VotesType, VoteInputType } from '../types/VoteType';
import { createRatingsMap, calcInstanceRating } from '../../services/linkService';
import { ratingRepository, linkRepository, userRepository } from '../source';

const getRatingsMap = async ({ linkInstanceUuid, linkInstanceId, userUuid, userId }) => {
  
  const avgRatings = await ratingRepository.getAverages([linkInstanceId]);
  const avgRatingsMap = createRatingsMap(avgRatings);
  const instanceRating = calcInstanceRating(avgRatingsMap[linkInstanceId] || {});
  
  let userRatingsMap = {};
  
  if (userId) { 
    const userRatings = await ratingRepository.getInstanceRatingsByUser(linkInstanceId, userId);
    userRatings.forEach(rating => {
      const propertyName = rating.property.charAt(0).toUpperCase() + rating.property.slice(1);
      userRatingsMap[`user${propertyName}Rating`] = rating.rating;
    });
  };

  return {
    userUuid,
    linkInstanceUuid,
    ...avgRatingsMap[linkInstanceId],
    ...userRatingsMap,
    avgRating: instanceRating 
  };

};

export const RatingQueryFields = {
  
  ratings: {
    
    type: LinkInstanceRatingsType,
    description: 'Get ratings by link instance and user',
    args: {
      userUuid: { type: GraphQLString },
      linkInstanceUuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { userUuid, linkInstanceUuid }) => {
      
      log.info("query=get-ratings", `user=${request.user ? request.user.uuid : null}`, `userUuid=${userUuid}`, `linkInstanceUuid=${linkInstanceUuid}`);
     
      const userId = !userUuid ? null : await userRepository.getUserIdByUuid(userUuid);
      const linkInstanceId = 
        await linkRepository.getInstanceIdByUuid(linkInstanceUuid);
        
      return await getRatingsMap({ linkInstanceUuid, linkInstanceId, userUuid, userId });
    
    }
  
  }

};

export const RatingMutationFields = {
  
  rating: {
    
    type: LinkInstanceRatingsType,
    description: 'Save a rating',
    args: {
      rating: { type: RatingInputType }
    },
    resolve: async ({ request }, { rating }) => {
      
      log.info("query=save-rating", `user=${request.user ? request.user.uuid : null}`, "rating:", rating);
      
      if (!request.user) {
        throw new Error('not-authorized');
      }

      const { linkInstanceUuid, userUuid } = rating;
      const userId = await userRepository.getUserIdByUuid(userUuid || request.user.uuid);
      const linkInstanceId = 
        await linkRepository.getInstanceIdByUuid(linkInstanceUuid);

      await ratingRepository.saveRating({
        userId,
        linkInstanceId,
        property: rating.property,
        rating: rating.rating
      });

      return await getRatingsMap({ linkInstanceUuid, linkInstanceId, userUuid, userId });
    
    }
  
  }

};

export const VoteMutationFields = {
  
  vote: {
    
    type: VotesType,
    description: 'Cast a vote',
    args: {
      linkInstanceUuid: { type: GraphQLString },
      value: { type: GraphQLInt }
    },
    resolve: async ({ request }, { linkInstanceUuid, value }) => {
      return {
        linkInstanceUuid,
        votes: value
      };
    }
  
  }

};
