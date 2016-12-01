import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import me from './queries/me';
import content from './queries/content';
import localities from './queries/localities';
import { AccountQueryFields } from './queries/account';
import transportTypes from './queries/transportTypes';
import intl from './queries/intl';
import { TransitLinkMutationFields, TransitLinkQueryFields } from './queries/links';
import { UserMutationFields, UserQueryFields } from './queries/users';
import * as links from './queries/links';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      content,
      localities,
      profile: AccountQueryFields.profile,
      userLinks: AccountQueryFields.links,
      transportTypes,
      link: TransitLinkQueryFields.link,
      linkInstance: TransitLinkQueryFields.linkInstance,
      links: TransitLinkQueryFields.links,
      user: UserQueryFields.user,
      intl
    }
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      linkInstance: TransitLinkMutationFields.linkInstance,
      user: UserMutationFields.user
    },
  })
});

export default schema;
