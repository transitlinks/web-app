import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';

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
