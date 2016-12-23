import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import runtime from './runtime';
import intl from './intl';
import auth from './auth';
import login from './login';
import autocomplete from './autocomplete';
import editLink from './editLink';
import viewLinkInstance from './viewLinkInstance';
import searchLinks from './searchLinks';
import profile from './profile';

export default combineReducers({
  runtime,
  intl,
  auth,
  routing: routerReducer,
  login,
  autocomplete,
  editLink,
  viewLinkInstance,
  searchLinks,
  profile
});
