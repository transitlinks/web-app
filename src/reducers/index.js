import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import runtime from './runtime';
import global from './global';
import intl from './intl';
import auth from './auth';
import env from './env';
import login from './login';
import autocomplete from './autocomplete';
import editLink from './editLink';
import viewLinkInstance from './viewLinkInstance';
import editCheckIn from './editCheckIn';
import viewCheckIn from './viewCheckIn';
import searchLinks from './searchLinks';
import profile from './profile';
import home from './home';

export default combineReducers({
  runtime,
  global,
  intl,
  auth,
  env,
  routing: routerReducer,
  login,
  autocomplete,
  editLink,
  viewLinkInstance,
  editCheckIn,
  viewCheckIn,
  searchLinks,
  profile,
  home
});
