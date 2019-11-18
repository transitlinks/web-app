import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull, GraphQLFloat,
} from 'graphql';

export const LinkTerminalType = new GraphQLObjectType({
  name: 'LinkTerminal',
  description: 'Departure or arrival terminal.',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: GraphQLString },
    transport: { type: GraphQLString },
    transportId: { type: GraphQLString },
    date: { type: GraphQLString },
    time: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    locality: { type: GraphQLString },
    country: { type: GraphQLString }
  })
});

export default LinkTerminalType;
