import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CheckIn.css';
import { injectIntl } from 'react-intl';
import CheckInItem from '../CheckInItem';

const ViewCheckIn = ({
  checkInItem, transportTypes
}) => {

  return (
    <div className={s.container}>
      <CheckInItem checkInItem={checkInItem} transportTypes={transportTypes} editable />
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    user: state.auth.auth.user,
    env: state.env
  }), {
  })(withStyles(s)(ViewCheckIn))
);
