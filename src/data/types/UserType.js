import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString },
    username: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    photo: { type: GraphQLString }
  },
});

export const UserInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  description: 'Input properties for User',
  fields: () => ({
    uuid: { type: GraphQLString },
    email: { type: GraphQLString },
    username: { type: GraphQLString },
    password: { type: GraphQLString }
  })
});

export default UserType;
