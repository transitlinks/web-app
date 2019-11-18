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
    resolve: async ({ request }, params) => {

      const { locality, type } = params;

      log.info(graphLog(request, 'search-terminals',`locality=${locality} type=${type}`));

      const checkIns = await postRepository.getCheckIns({ locality: { $like: `%${locality}%` } });
      console.log('got checkins', checkIns);
      const checkInIds = checkIns.map(checkIn => checkIn.id);

      let terminalQueryParams = {};
      if (!type) {
        terminalQueryParams = { checkInId: checkInIds };
      } else {
        terminalQueryParams = { checkInId: checkInIds, type };
      }

      const terminals = await postRepository.getTerminals(terminalQueryParams);
      console.log('got terminals', terminals);
      return terminals.map(terminal => {
        const { checkIn, linkedTerminal } = terminal;
        return {
          uuid: terminal.uuid
        };
      });
    }

  }


};
