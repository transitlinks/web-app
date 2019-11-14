import {
  SET_AUTH
} from '../constants';

export default function setAuth(state = null, action) {

  switch (action.type) {

    case SET_AUTH:
      const { auth } = action.payload;
      console.log("set auth", auth);
      return { ...state, auth: auth };
    default:
      return { ...state };

  }

}
