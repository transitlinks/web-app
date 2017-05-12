import {
  SET_VAR
} from '../constants';

export default function setAuth(state = null, action) {
  
  switch (action.type) {
    
    case SET_VAR:
      const endState = { ...state };
      endState[action.payload.name] = action.payload.value;
      return endState;
    default:
      return { ...state };

  }

}
