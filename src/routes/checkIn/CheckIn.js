import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { resetCheckIn } from '../../actions/editCheckIn';
import { getComments } from '../../actions/viewCheckIn';
import { navigate } from '../../actions/route';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CheckIn.css';
import ViewCheckIn from '../../components/ViewCheckIn';
import EditCheckIn from '../../components/EditCheckIn';
import { FormattedRelative } from 'react-intl';

const title = 'Transitlinks - Check In';

class CheckIn extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      edit: props.edit,
      checkIn: props.checkIn,
      updated: 0
    };

  }

  componentDidMount() {
    this.updateComponent(this.props);
  }

  componentWillReceiveProps(props) {
    this.updateComponent(props);
  }

  updateComponent(props) {

    if (props.deleted && props.deleted.uuid === props.checkIn.uuid) {
      props.resetCheckIn();
      props.navigate(`/link/${props.checkIn.link.uuid}?deleted=1`);
      return;
    }

    // Transition to link when save is detected
    const stateUpdated = this.state.updated;
    const propUpdated = props.saved ? props.saved.saved : stateUpdated;

    const state = {
      edit: props.edit,
      checkIn: (propUpdated > stateUpdated) ? props.saved : props.checkIn,
      updated: propUpdated
    };

    const { savedCommentUuid } = this.state;
    if (props.savedComment) {
      if (!savedCommentUuid || savedCommentUuid !== props.savedComment.uuid) {
        props.getComments(this.state.checkIn.uuid);
      }
      state.savedCommentUuid = props.savedComment.uuid;
    }

    this.setState(state);

    if (propUpdated > stateUpdated) {
      props.resetCheckIn();
      props.navigate(`/link-instance/${props.saved.privateUuid}`);
      return;
    }

    if (props.edit) {
      props.resetCheckIn(props.checkIn);
    }

  }

  render() {

    this.context.setTitle(title);
    const {
      checkIn,
      ratings,
      checkInMedia,
      transportTypes,
      comments,
      stateComments
    }  = this.props;

    return (
      <div className={s.root}>
        <div className={s.container}>
          {
            !this.state.edit ?
              <ViewCheckIn
                checkIn={checkIn}
                initialRatings={ratings}
                checkInMedia={checkInMedia}
                comments={stateComments || comments} /> :
              <EditCheckIn
                transportTypes={transportTypes}
                checkIn={checkIn} />
          }
          <div>

          </div>
        </div>
      </div>
    );

  }

}

CheckIn.propTypes = {
  checkIn: PropTypes.object.isRequired
};
CheckIn.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  saved: state.editCheckIn.checkIn,
  deleted: state.editCheckIn.deleteCheckIn,
  savedComment: state.viewCheckIn.savedComment,
  stateComments: state.viewCheckIn.comments,
}), {
  resetCheckIn, getComments, navigate
})(withStyles(s)(CheckIn));
