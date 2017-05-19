import {
  SET_PROPERTY
} from '../constants';

export default function home(state = {}, action) {
  
  const endState = { ...state };

  switch (action.type) {
    
    case SET_PROPERTY:
      endState[action.payload.name] = action.payload.value;
      return endState;
    default:
      return state;

  }
  
}
