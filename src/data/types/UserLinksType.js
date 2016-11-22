import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

const UserLinkInstanceType = new GraphQLObjectType({
  name: 'UserLinkInstance',
  fields: {
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    transport: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const UserLinksType = new GraphQLObjectType({
  name: 'UserLinks',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    links: { type: new GraphQLList(UserLinkInstanceType) }
  },
});

export default UserLinksType;
