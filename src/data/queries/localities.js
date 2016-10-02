import { GraphQLList, GraphQLString } from 'graphql';
import LocalityType from '../types/LocalityType';
import { placesApi } from '../source';

export default {

  type: new GraphQLList(LocalityType),
  description: 'List of places from Google Maps Places API for autocomplete search', 
  args: {
    input: { type: GraphQLString }
  },
  resolve: async (root, { input }) => {
    const predictions = await placesApi.autocomplete(input);
    return predictions.map(prediction => ({
      id: prediction.place_id,
      name: prediction.description,
      lat: "0",
      lng: "0"
    }));

  }

};

