import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/terminals');

import {
  postRepository
} from '../source';

import {
	LinkTerminalType
} from '../types/LinkTerminalType';

import {
  GraphQLString,
  GraphQLList
} from 'graphql';


export const TerminalQueryFields = {

  terminals: {

    type: new GraphQLList(LinkTerminalType),
    description: 'Search terminals',
    args: {
      locality: { type: GraphQLString },
      type: { type: GraphQLString }
    },
    resolve: async ({ request }, { locality, type }) => {
      log.info(graphLog(request, 'search-terminals',`locality=${locality} type=${type}`));
      const checkIns = await postRepository.getCheckIns({ locality: { $like: `%${locality}%` } });
      console.log('got checkins', checkIns);
      const checkInIds = checkIns.map(checkIn => checkIn.id);
      const terminals = await postRepository.getTerminals({ checkInId: checkInIds });
      console.log('got terminals', terminals);
      return terminals.map(terminal => terminal.json());
    }

  }


};
