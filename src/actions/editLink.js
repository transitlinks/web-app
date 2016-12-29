import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  SELECTED_LOCALITY,
  SELECTED_ADDRESS,
  SET_TRANSPORT,
  SET_PROPERTY,
  SAVE_LINK_START,
  SAVE_LINK_SUCCESS,
  SAVE_LINK_ERROR,
  LINK_RESET
} from '../constants';

export function selectLocality({ endpoint, locality }) {
  
  return async (dispatch, getState) => {
    
    dispatch({
      type: SELECTED_LOCALITY,
      payload: {
        endpoint,
        locality
      },
    });

    return true;
  
  };

}

export function selectAddress({ endpoint, locality }) {
  
  return async (dispatch, getState) => {
    
    dispatch({
      type: SELECTED_ADDRESS,
      payload: {
        endpoint,
        locality
      },
    });

    return true;
  
  };

}

export function setProperty(name, value) {
  
  return async (dispatch) => {
    
    dispatch({
      type: SET_PROPERTY,
      payload: {
        name,
        value
      },
    });

    return true;
  
  };

}

export function setTransport(transport) {
  
  return async (dispatch) => {
    
    dispatch({
      type: SET_TRANSPORT,
      payload: {
        transport
      },
    });

    return true;
  
  };

}

export function resetLink(linkInstance) {
  return async (dispatch) => {
    dispatch({
      type: LINK_RESET,
      payload: {
        linkInstance
      }
    });
  };
}

export function saveLinkInstance({ linkInstance }) {
  
  return async (...args) => {
    
    const query = `
      mutation saveLinkInstance {
        linkInstance(linkInstance:${toGraphQLObject(linkInstance)}) {
          uuid,
          link {
            uuid,
            from { apiId, name, description, lat, lng },
            to { apiId, name, description, lat, lng }
          },
          transport {
            slug
          }
        }
      }
    `;
    
    return graphqlAction(
      ...args, 
      { query }, [ 'linkInstance' ],
      SAVE_LINK_START,
      SAVE_LINK_SUCCESS,
      SAVE_LINK_ERROR
    );
  
  };

}
