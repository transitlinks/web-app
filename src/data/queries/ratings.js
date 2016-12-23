import { 
  GraphQLInt, 
  GraphQLString,
  GraphQLList 
} from 'graphql';
import { RatingType, RatingInputType } from '../types/RatingType';
import { VotesType, VoteInputType } from '../types/VoteType';
import { ratingRepository, linkRepository, userRepository } from '../source';

export const RatingMutationFields = {
  
  rating: {
    
    type: new GraphQLList(RatingType),
    description: 'Save a rating',
    args: {
      rating: { type: RatingInputType }
    },
    resolve: async ({ request }, { rating }) => {

      const userId = userRepository.getUserIdByUuid(rating.userUuid);
      const linkInstanceId = 
        linkRepository.getInstanceIdByUuid(rating.linkInstanceUuid);

      await ratingRepository.saveRating({
        userId,
        linkInstanceId,
        property: rating.property,
        rating: rating.rating
      });

      const ratings = await ratingRepository.getInstanceRatingsByUser(
        linkInstanceId,
        userId
      );

      return ratings.map(r => ({
        userUuid: rating.userUuid,
        linkInstanceUuid: rating.linkInstanceUuid,
        property: r.property,
        rating: r.rating
      }));
    
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
