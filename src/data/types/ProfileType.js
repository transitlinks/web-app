import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull, GraphQLInt,
} from 'graphql';

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLString },
    photo: { type: GraphQLString },
    avatar: { type: GraphQLString },
    logins: { type: GraphQLInt }
  },
});

export default ProfileType;
