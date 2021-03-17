import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getFeedItem } from '../../actions/checkIns';
import { getComments } from '../../actions/comments';
import { setProperty } from '../../actions/properties';
import { navigate } from '../../actions/route';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CheckIn.css';
import CheckInView from '../../components/CheckIn';
import { updateLastCoords } from '../../services/linkService';
import { saveTripCoord, getActiveTrip } from '../../actions/trips';
import { getLastCoords } from '../../actions/global';
import { isMobile } from '../../components/utils';
import ReactGA from 'react-ga';

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
    this.props.setProperty('posts.savedCheckIn', null);
    this.props.setProperty('posts.savedPost', null);
    this.props.setProperty('posts.savedTerminal', null);
    this.props.setProperty('posts.deleteCandidate', null);
    ReactGA.initialize('G-WJY0GVR87Z');
    ReactGA.pageview('/check-in');
  }

  componentDidUpdate(prevProps) {

    const props = this.props;

    /*
    const activeTrip = this.props.feedItem.fetchedAt > (this.props.activeTripUpdatedAt || 0) ? this.props.activeTrip : this.props.updatedActiveTrip;
    if (activeTrip && isMobile()) {
      updateLastCoords(props.lastCoords, prevProps.lastCoords, props.saveTripCoord, props.getLastCoords);
    }
     */

    if (props.deleted) {
      props.setProperty('posts.deletedCheckIn', null);
      props.setProperty('posts.editCheckIn', false);
      props.navigate(props.deleted.nextUrl);
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

    if (props.savedTrip) {
      props.setProperty('trips.savedTrip', null);
      props.setProperty('trips.editTripName', null);
      props.getFeedItem(props.feedItem.checkIn.uuid, 'frame-edit', true);
      props.getActiveTrip();
    }

    if (props.deletedTrip) {
      props.setProperty('trips.deletedTrip', null);
      props.getFeedItem(props.feedItem.checkIn.uuid, 'frame-edit', true);
      props.getActiveTrip();
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
      openTerminals,
      view
    } = this.props;
    return (
      <div className={s.root}>
        <div className={s.container}>
          <CheckInView checkInItem={feedItem} openTerminals={openTerminals} transportTypes={transportTypes} view={view} />
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
  savedTrip: state.trips.savedTrip,
  deletedTrip: state.trips.deletedTrip,
  savedLike: state.posts.savedLike,
  updatedActiveTrip: state.trips.activeTrip,
  activeTripUpdatedAt: state.trips.activeTripUpdatedAt,
  lastCoords: state.global['geolocation.lastCoords']
}), {
  getFeedItem,
  getComments,
  navigate,
  setProperty,
  saveTripCoord,
  getLastCoords,
  getActiveTrip
})(withStyles(s)(CheckIn));
