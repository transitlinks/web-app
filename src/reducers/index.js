import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import runtime from './runtime';
import intl from './intl';
import auth from './auth';
import login from './login';
import autocomplete from './autocomplete';
import editLink from './editLink';
import searchLinks from './searchLinks';

export default combineReducers({
  runtime,
  intl,
  auth,
  routing: routerReducer,
  login,
  autocomplete,
  editLink,
  searchLinks
});
