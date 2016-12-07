import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';
import { LinkInstanceType } from './TransitLinkType';

const UserLinksType = new GraphQLObjectType({
  name: 'UserLinks',
  fields: {
    uuid: { type: new GraphQLNonNull(GraphQLString) },
    linkInstances: { type: new GraphQLList(LinkInstanceType) }
  },
});

export default UserLinksType;
