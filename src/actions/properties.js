import {
  SET_PROPERTY
} from '../constants';


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
