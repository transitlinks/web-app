import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull, GraphQLInt, GraphQLFloat,
} from 'graphql';

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLString },
    photo: { type: GraphQLString },
    avatar: { type: GraphQLString },
    avatarSource: { type: GraphQLString },
    avatarX: { type: GraphQLFloat },
    avatarY: { type: GraphQLFloat },
    avatarScale: { type: GraphQLFloat },
    logins: { type: GraphQLInt }
  },
});

export default ProfileType;
