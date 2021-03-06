import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import HomeView from '../../components/Home';

import { connect } from "react-redux";
import { getGeolocation, getLastCoords } from "../../actions/global";
import { getFeed, getFeedItem } from "../../actions/checkIns";
import { getUserDepartures } from '../../actions/posts';
import { setProperty } from "../../actions/properties";
import { saveTripCoord, getActiveTrip } from "../../actions/trips";
import { getClientId } from "../../core/utils";

import debounce from "lodash.debounce";

const title = 'Transitlinks';

const getParams = (props) => {
  const { tags, offset, query } = props;
  const params = { limit: 8, offset: offset || 0 };
  if (query && query.tags) params.tags = query.tags;
  if (query && query.locality) params.locality = query.locality;
  if (query && query.country) params.country = query.country;
  if (query && query.linkedLocality) params.linkedLocality = query.linkedLocality;
  if (query && query.from) params.from = query.from;
  if (query && query.to) params.to = query.to;
  if (query && query.route) params.route = query.route;
  if (query && query.user) params.user = query.user;
  if (query && query.trip) params.trip = query.trip;
  return params;
};

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {

    console.log('did mount ghome');
    this.props.setProperty('posts.feedOffset', 0);

    window.onscroll = debounce(() => {

      this.setState({
        innerHeight: window.innerHeight,
        scrollTop: document.documentElement.scrollTop,
        offsetHeight: document.documentElement.offsetHeight
      });
      // Checks that the page has scrolled to the bottom
      if (
        Math.ceil(window.innerHeight + document.documentElement.scrollTop) >= document.documentElement.offsetHeight
      ) {

        if (this.state.fetchedOffset === this.props.offset) {
          return;
        }

        const clientId = getClientId();
        const params = getParams(this.props);
        console.log('fetch with params', params);
        this.setState({ fetchedOffset: params.offset });
        this.props.getFeed(clientId, { ...params, add: true });
      }
    }, 100);

    const clientId = getClientId();
    this.props.setProperty('posts.editPost', {});
    this.props.setProperty('editTerminal.terminal', {});
    this.props.setProperty('editTerminal.terminalProperties', {});
    this.props.setProperty('posts.disabledTags', []);
    this.props.setProperty('posts.showSettings', false);
    this.props.setProperty('posts.fetchedFeedItems', {});
    this.props.setProperty('posts.checkIn', null);
    this.props.setProperty('posts.deleteCandidate', null);

    const checkIn = this.props.savedCheckIn;
    if (checkIn) {
      this.props.getFeedItem(checkIn.uuid, 'frame-new');
    }

    this.props.getGeolocation();
    const params = getParams(this.props);
    params.offset = 0;
    this.props.getFeed(clientId, params);
    this.props.getUserDepartures();

    window.gtag('config', 'G-WJY0GVR87Z', {
      page_path: '/',
    });

    const { profile } = this.props;
    if (profile && profile.logins === 1) {
      window.location.href = '/account';
    }

  }

  componentDidUpdate(prevProps) {

    const prevFrame = prevProps.frame;
    const frame = this.props.frame;

    const prevQuery = prevProps.query;
    const query = this.props.query;

    const prevCheckIn = prevProps.savedCheckIn;
    const checkIn = this.props.savedCheckIn;

    const prevPost = prevProps.savedPost;
    const post = this.props.savedPost;

    const prevDelCheckIn = prevProps.deletedCheckIn;
    const delCheckIn = this.props.deletedCheckIn;

    const clientId = getClientId();
    const params = getParams(this.props);
    params.offset = 0;

    if (checkIn) {
      if (!prevCheckIn || prevCheckIn.saved !== checkIn.saved) {
        this.props.getFeed(clientId, params);
      }
    }


    if (delCheckIn) {
      if (!prevDelCheckIn || prevDelCheckIn.deleted !== delCheckIn.deleted) {
        this.props.setProperty('posts.showSettings', '');
        this.props.getFeed(clientId, params);
      }
    }

    if (checkIn && post) {
      if (!prevPost || prevPost.saved !== post.saved) {
        this.props.setProperty('posts.postText', '');
        this.props.setProperty('posts.mediaItems', []);
        this.props.getFeedItem(checkIn.uuid, 'frame-new');
      }
    }

    if (frame && frame !== prevFrame) {
      setTimeout(() => {
        document.getElementById(`feed-item-${frame}`).scrollIntoView(true);
      }, 100);
    }

    if (this.props.feed && this.props.fetchedFeed) {
      if (this.props.feed.fetchedAt > this.props.fetchedFeed.fetchedAt) {
        this.props.setProperty('posts.feed', this.props.feed);
      }
    }

    const savedTerminal = this.props.savedTerminal;
    if (checkIn && savedTerminal) {
      this.props.getFeedItem(checkIn.uuid, 'frame-new', true);
    }

    if (checkIn && this.props.deletedPost) {
      this.props.setProperty('posts.deletedPost', null);
      this.props.getFeedItem(checkIn.uuid, 'frame-new', true);
    }

    if (checkIn && this.props.deletedTerminal) {
      this.props.setProperty('posts.deletedTerminal', null);
      this.props.getFeedItem(checkIn.uuid, 'frame-new', true);
    }

    if (checkIn && this.props.savedTrip) {
      this.props.setProperty('trips.savedTrip', null);
      this.props.setProperty('trips.editTripName', null);
      this.props.getFeedItem(checkIn.uuid, 'frame-new', true);
      this.props.getActiveTrip();
    }

    if (checkIn && this.props.deletedTrip) {
      this.props.setProperty('trips.deletedTrip', null);
      this.props.getFeedItem(checkIn.uuid, 'frame-new', true);
      this.props.getActiveTrip();
    }

    if (prevQuery.tags !== query.tags || prevQuery.user !== query.user || prevQuery.trip !== query.trip) {
      this.props.getFeed(clientId, params);
    }

    const { savedComment, deletedComment } = this.props;
    if (savedComment) {
      this.props.setProperty('posts.savedComment', null);
      if (savedComment.checkInUuid) {
        this.props.getFeedItem(savedComment.checkInUuid, savedComment.frameId, true);
      }
    }
    if (deletedComment) {
      this.props.setProperty('posts.deletedComment', null);
      if (deletedComment.checkInUuid) {
        this.props.getFeedItem(deletedComment.checkInUuid, deletedComment.frameId, true);
      }
    }

    const savedLike = this.props.savedLike;
    if (savedLike) {
      this.props.setProperty('posts.savedLike', null);
      if (savedLike.checkInUuid) {
        this.props.getFeedItem(savedLike.checkInUuid, savedLike.frameId, true);
      }
    }

  }

  render() {

    this.context.setTitle(title);

    const { profile, savedProfile, feed, query, transportTypes, post } = this.props;

    return (
      <div>
        <div className={s.root}>
          <HomeView feed={feed} query={query} transportTypes={transportTypes} post={post} />
        </div>
        {
          this.props.loadingFeed &&
          <div className={s.windowStats}>
            {
              !this.props.offset || this.props.offset === 0 ?
                <div className={s.loading}>
                  <div className={s.loadingio}>
                    <div className={s.ldio}>
                      <div></div>
                    </div>
                  </div>
                </div> :
                <span>Loading posts {(this.props.offset || 0) + 1} - {(this.props.offset || 0) + 1 + 8}...</span>
            }

          </div>
        }
      </div>
    );
  }
}

Home.propTypes = {
};
Home.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  savedCheckIn: state.posts.checkIn,
  deletedCheckIn: state.posts.deletedCheckIn,
  savedPost: state.posts.post,
  deletedPost: state.posts.deletedPost,
  deletedTerminal: state.posts.deletedTerminal,
  savedTerminal: state.editTerminal.savedTerminal,
  savedComment: state.posts.savedComment,
  deletedComment: state.posts.deletedComment,
  savedLike: state.posts.savedLike,
  offset: state.posts.feedOffset,
  loadingFeed: state.posts.loadingFeed,
  loadFeedOffset: state.posts.loadFeedOffset,
  savedTrip: state.trips.savedTrip,
  updatedActiveTrip: state.trips.activeTrip,
  activeTripUpdatedAt: state.trips.activeTripUpdatedAt,
  deletedTrip: state.trips.deletedTrip,
  lastCoords: state.global['geolocation.lastCoords'],
  savedProfile: state.profile.savedProfile,
  fetchedFeed: state.posts.feed
}), {
  getGeolocation,
  getFeed,
  getFeedItem,
  setProperty,
  saveTripCoord,
  getLastCoords,
  getActiveTrip,
  getUserDepartures
})(withStyles(s)(Home));
