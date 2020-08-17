import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getFeedItem } from '../../actions/posts';
import { getComments } from '../../actions/comments';
import { setProperty } from '../../actions/properties';
import { navigate } from '../../actions/route';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CheckIn.css';
import CheckInView from '../../components/CheckIn';

const title = 'Transitlinks - Check In';

class CheckIn extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      checkInItem: props.feedItem,
      updated: 0
    };

  }

  componentDidMount() {
    this.props.setProperty('posts.editPost', {});
    this.props.setProperty('editTerminal.terminal', {});
    this.props.setProperty('editTerminal.terminalProperties', {});
    this.props.setProperty('posts.disabledTags', []);
    this.props.setProperty('posts.fetchedFeedItem', null);
    this.props.setProperty('posts.checkIn', null);
    this.props.getFeedItem(this.props.feedItem.checkIn.uuid, 'frame-edit');
    this.updateComponent(this.props);
  }

  componentWillReceiveProps(props) {
    this.updateComponent(props);
  }

  updateComponent(props) {

    if (props.deleted) {
      props.setProperty('posts.deletedCheckIn', null);
      props.setProperty('posts.editCheckIn', false);
      props.navigate('/');
      return;
    }

    if (props.savedTerminal) {
      props.setProperty('posts.savedTerminal', null);
      props.getFeedItem(props.feedItem.checkIn.uuid, 'frame-edit', true);
    }

    if (props.savedPost) {
      props.setProperty('posts.savedPost', null);
      props.getFeedItem(props.savedPost.checkInUuid, 'frame-edit', true);
    }

    if (props.savedCheckIn) {
      props.setProperty('posts.savedCheckIn', null);
      props.getFeedItem(props.savedCheckIn.uuid, 'frame-edit', true);
    }

    if (props.deletedPost) {
      props.setProperty('posts.deletedPost', null);
      props.getFeedItem(props.deletedPost.checkInUuid, 'frame-edit', true);
    }

    if (props.deletedTerminal) {
      props.setProperty('posts.deletedTerminal', null);
      props.getFeedItem(props.deletedTerminal.checkInUuid, 'frame-edit', true);
    }

    const { savedComment, deletedComment } = props;
    if (savedComment) {
      props.setProperty('posts.savedComment', null);
      if (savedComment.checkInUuid) {
        props.getFeedItem(props.savedComment.checkInUuid, savedComment.frameId, true);
      }
    }

    if (deletedComment) {
      props.setProperty('posts.deletedComment', null);
      if (deletedComment.checkInUuid) {
        props.getFeedItem(props.deletedComment.checkInUuid, deletedComment.frameId, true);
      }
    }

    const { savedLike } = props;
    if (savedLike) {
      props.setProperty('posts.savedLike', null);
      if (savedLike.checkInUuid) {
        props.getFeedItem(props.savedLike.checkInUuid, savedLike.frameId, true);
      }
    }

  }

  render() {

    this.context.setTitle(title);

    const {
      feedItem,
      transportTypes,
      openTerminals
    } = this.props;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <CheckInView checkInItem={feedItem} openTerminals={openTerminals} transportTypes={transportTypes} />
        </div>
      </div>
    );

  }

}

CheckIn.propTypes = {
  checkInItem: PropTypes.object.isRequired
};
CheckIn.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  saved: state.editCheckIn.checkIn,
  deleted: state.posts.deletedCheckIn,
  deletedPost: state.posts.deletedPost,
  deletedTerminal: state.posts.deletedTerminal,
  savedTerminal: state.editTerminal.savedTerminal,
  savedPost: state.posts.savedPost,
  savedCheckIn: state.posts.checkIn,
  savedComment: state.posts.savedComment,
  deletedComment: state.posts.deletedComment,
  savedLike: state.posts.savedLike
}), {
  getFeedItem, getComments, navigate, setProperty
})(withStyles(s)(CheckIn));
