import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
} from 'graphql';

const LocalityType = new GraphQLObjectType({
  name: 'Locality',
  fields: { 
    id: { type: new GraphQLNonNull(GraphQLString) },
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    apiId: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    countryLong: { type: GraphQLString },
    countryShort: { type: GraphQLString },
    lat: { type: new GraphQLNonNull(GraphQLFloat) },
    lng: { type: new GraphQLNonNull(GraphQLFloat) }
  },
});

export default LocalityType;
