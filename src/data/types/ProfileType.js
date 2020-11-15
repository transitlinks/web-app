import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLString },
    photo: { type: GraphQLString }
  },
});

export default ProfileType;
