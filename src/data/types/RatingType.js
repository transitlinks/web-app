import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull
} from 'graphql';

export const LinkInstanceRatingsType = new GraphQLObjectType({
  name: 'LinkInstanceRatings',
  fields: {
    userUuid: { type: GraphQLString },
    linkInstanceUuid: { type: GraphQLString },
    avgRating: { type: GraphQLFloat },
    avgAvailabilityRating: { type: GraphQLFloat },
    avgDepartureRating: { type: GraphQLFloat },
    avgArrivalRating: { type: GraphQLFloat },
    avgAwesomeRating: { type: GraphQLFloat },
    userAvailabilityRating: { type: GraphQLInt },
    userDepartureRating: { type: GraphQLInt },
    userArrivalRating: { type: GraphQLInt },
    userAwesomeRating: { type: GraphQLInt }
  }
});

export const RatingType = new GraphQLObjectType({
  name: 'Rating',
  fields: {
    userUuid: { type: GraphQLString },
    linkInstanceUuid: { type: GraphQLString },
    property: { type: GraphQLString },
    rating: { type: GraphQLInt }
  }
});

export const RatingInputType = new GraphQLInputObjectType({
  name: 'RatingInput',
  fields: {
    userUuid: { type: GraphQLString },
    linkInstanceUuid: { type: GraphQLString },
    property: { type: GraphQLString },
    rating: { type: GraphQLInt }
  }
});

export default RatingType;
