import { graphqlAction } from './utils';
import {
  SELECTED_LOCALITY,
  SET_TRANSPORT,
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

export function resetLink() {
  return async (dispatch) => {
    dispatch({
      type: LINK_RESET  
    });
  };
}

export function saveLink({ link }) {
  
  return async (...args) => {
    
    let json = JSON.stringify(link);
    json.replace(/\\"/g,"\uFFFF"); //U+ FFFF
    json = json.replace(/\"([^"]+)\":/g,"$1:").replace(/\uFFFF/g,"\\\""); 
    const query = `
      mutation saveLink {
        link(link:${json}) {
          id,
          from{id,name,lat,lng},
          to{id,name,lat,lng}
        }
      }
    `;

    return graphqlAction(
      ...args, 
      { query }, [ 'link' ],
      SAVE_LINK_START,
      SAVE_LINK_SUCCESS,
      SAVE_LINK_ERROR
    );
  
  };

}
