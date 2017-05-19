import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import runtime from './runtime';
import intl from './intl';
import auth from './auth';
import env from './env';
import login from './login';
import autocomplete from './autocomplete';
import editLink from './editLink';
import viewLinkInstance from './viewLinkInstance';
import searchLinks from './searchLinks';
import profile from './profile';
import home from './home';

export default combineReducers({
  runtime,
  intl,
  auth,
  env,
  routing: routerReducer,
  login,
  autocomplete,
  editLink,
  viewLinkInstance,
  searchLinks,
  profile,
  home
});
