import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
} from 'graphql';

const TransportTypeType = new GraphQLObjectType({
  name: 'TransportTypeType',
  fields: { 
    id: { type: new GraphQLNonNull(GraphQLString) },
    uuid: { type: GraphQLString },
    slug: { type: GraphQLString },
    description: { type: GraphQLString }
  },
});

export default TransportTypeType;
