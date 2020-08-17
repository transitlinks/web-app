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
import editCheckIn from './editCheckIn';
import editTerminal from './editTerminal';
import searchLinks from './searchLinks';
import profile from './profile';
import posts from './posts';
import discover from './discover';
import links from './links';
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
  editCheckIn,
  editTerminal,
  searchLinks,
  profile,
  posts,
  discover,
  links,
  home
});
