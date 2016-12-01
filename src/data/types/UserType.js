import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString }
  },
});

export const UserInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  description: 'Input properties for User',
  fields: () => ({
    uuid: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString }
  })
});

export default UserType;
