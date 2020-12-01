import { GraphQLList, GraphQLString, GraphQLInt } from 'graphql';
import LocalityType from '../types/LocalityType';
import { placesApi } from '../source';

export default {

  type: new GraphQLList(LocalityType),
  description: 'List of places from Google Maps Places API for autocomplete search',
  args: {
    input: { type: GraphQLString },
    types: { type: GraphQLString },
    location: { type: GraphQLString },
    radius: { type: GraphQLInt }
  },
  resolve: async (root, { input, types, location, radius }) => {
    const predictions = await placesApi.autocomplete(
      input, types, location, radius
    );
    return predictions.map(prediction => ({
      apiId: prediction.place_id,
      description: prediction.description,
      countryLong: prediction.terms[prediction.terms.length - 1].value,
      latitude: "0",
      longitude: "0"
    }));

  }

};

