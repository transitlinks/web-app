import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';

export const VotesType = new GraphQLObjectType({
  name: 'Votes',
  fields: {
    linkInstanceUuid: { type: GraphQLString },
    votes: { type: GraphQLInt }
  }
});

export const VoteInputType = new GraphQLInputObjectType({
  name: 'Vote',
  fields: {
    linkInstanceUuid: { type: GraphQLString },
    value: { type: GraphQLInt }
  }
});

export default VotesType;
