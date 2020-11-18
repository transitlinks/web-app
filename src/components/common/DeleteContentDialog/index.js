import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './DeleteContentDialog.css';
import { setProperty } from '../../../actions/properties';
import { injectIntl } from 'react-intl';

const DeleteContentDialog = ({ deleteCandidate, setProperty }) => {

  if (!deleteCandidate) return null;

  const cancelDeleteButton = (
    <div className={s.cancelDelete} onClick={() => setProperty('posts.deleteCandidate', null)}>
      CANCEL
    </div>
  );

  const confirmDeleteButton = (
    <div className={s.confirmDelete} onClick={() => {
      setProperty('posts.deleteCandidate', null);
      deleteCandidate.deleteItem(deleteCandidate.uuid);
    }}>
      DELETE
    </div>
  );

  if (deleteCandidate.type === 'checkIn' || deleteCandidate.type === 'trip') {
    return (
      <div className={s.deleteDialog}>
        <div className={s.deleteDialogText}>
          {deleteCandidate.dialogText}
        </div>
        <div className={s.deleteDialogButtons}>
          {cancelDeleteButton}
          {confirmDeleteButton}
        </div>
      </div>
    );
  } else {
    return (
      <div className={s.compactDeleteDialog}>
        <div className={s.deleteDialogText}>
          {deleteCandidate.dialogText}
        </div>
        <div className={s.deleteDialogButtons}>
          {cancelDeleteButton}
          {confirmDeleteButton}
        </div>
      </div>
    );
  }

};

export default injectIntl(
  connect(state => ({
    deleteCandidate: state.posts.deleteCandidate
  }), {
    setProperty
  })(withStyles(s)(DeleteContentDialog))
);
