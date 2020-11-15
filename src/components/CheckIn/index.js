import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CheckIn.css';
import { injectIntl } from 'react-intl';
import CheckInItem from '../CheckInItem';
import EditCheckInItem from '../EditCheckInItem';
import ErrorHeader from '../ErrorHeader';

const CheckIn = ({
  checkInItem, openTerminals, transportTypes, edit, addPost, editPost, editTerminal, savedTerninal, view, error
}) => {

  return (
    <div className={s.container}>
      <ErrorHeader />
      {
        (!addPost && !edit && !editPost.uuid && !editTerminal.uuid) ?
          <CheckInItem checkInItem={checkInItem}
                       transportTypes={transportTypes}
                       openTerminals={openTerminals}
                       frameId="frame-edit" view={view}
                       editable /> :
          <EditCheckInItem checkInItem={checkInItem}
                           openTerminals={openTerminals}
                           transportTypes={transportTypes}
                           view={view}
                           frameId="frame-edit" />
      }

    </div>
  );

};

export default injectIntl(
  connect(state => ({
    edit: state.posts.editCheckIn,
    addPost: state.posts.addPost,
    editPost: state.posts.editPost || {},
    editTerminal: state.editTerminal.terminal || {},
    user: state.auth.auth.user,
    error: state.posts.error,
    env: state.env
  }), {
  })(withStyles(s)(CheckIn))
);
