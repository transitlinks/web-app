import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
} from 'graphql';

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    photo: { type: GraphQLString }
  },
});

export default ProfileType;