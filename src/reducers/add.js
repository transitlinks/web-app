import { propToState } from "./utils";

export default function reduce(state = {}, action) {
  return propToState(action, 'add', { ...state });
}
