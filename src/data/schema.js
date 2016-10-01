import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import me from './queries/me';
import content from './queries/content';
import localities from './queries/localities';
import intl from './queries/intl';
import { TransitLinkMutationFields, TransitLinkQueryFields } from './queries/links';
import * as links from './queries/links';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      content,
      localities,
      link: TransitLinkQueryFields.link,
      links: TransitLinkQueryFields.links,
      intl
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      link: TransitLinkMutationFields.link
    },
  })
});

export default schema;
