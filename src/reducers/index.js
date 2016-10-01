import { combineReducers } from 'redux';
import runtime from './runtime';
import intl from './intl';
import autocomplete from './autocomplete';
import editLink from './editLink';

export default combineReducers({
  runtime,
  intl,
  autocomplete,
  editLink
});
