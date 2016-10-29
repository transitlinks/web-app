import {
  SET_AUTH
} from '../constants';

export default function setAuth(state = null, action) {
  
  switch (action.type) {
    
    case SET_AUTH:
      return { ...state, auth: action.payload.auth };
    default:
      return { ...state };

  }

}
