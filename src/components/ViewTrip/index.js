import React from 'react';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormattedMessage } from 'react-intl';
import s from './ViewTrip.css';
import cx from 'classnames';
import FontIcon from 'material-ui/FontIcon';
import Chip from 'material-ui/Chip';
import { orange600, green600 } from 'material-ui/styles/colors';
import msgTransport from '../common/messages/transport';
 
const ViewTrip = ({ 
  trip, deleted, navigate 
}) => {

  return (
    <div className={s.container}>
      A trip
    </div>
  );
}

export default connect(state => ({
}), {
  navigate
})(withStyles(s)(ViewTrip));
