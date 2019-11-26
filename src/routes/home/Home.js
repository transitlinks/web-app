import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import HomeView from '../../components/Home';

import { connect } from "react-redux";
import { getGeolocation } from "../../actions/global";
import { getFeed } from "../../actions/posts";
import { setProperty } from "../../actions/properties";
import {getClientId} from "../../core/utils";

import debounce from "lodash.debounce";

const title = 'Transitlinks';

const getParams = (props) => {
  const { tags, limit, offset } = props;
  const params = {};
  if (tags) params.tags = tags;
  if (limit) params.limit = 8;
  if (offset) params.offset = offset;
  return params;
};

class Home extends React.Component {

  constructor(props) {

    super(props);

    this.state = {};

    window.onscroll = debounce(() => {
      const {
        props: {
          error,
          isLoading,
          hasMore,
        },
      } = this;

      // Bails early if:
      // * there's an error
      // * it's already loading
      // * there's nothing left to load
      // if (error || isLoading || !hasMore) return;

      this.setState({
        innerHeight: window.innerHeight,
        scrollTop: document.documentElement.scrollTop,
        offsetHeight: document.documentElement.offsetHeight
      });
      // Checks that the page has scrolled to the bottom
      if (
        Math.ceil(window.innerHeight + document.documentElement.scrollTop) >= document.documentElement.offsetHeight
      ) {
        //let offset = (this.props.feed ? this.props.feed.feedItems.length : 0) + 3;
        //this.props.setProperty('posts.feedOffset', offset);
        const clientId = getClientId();
        const params = getParams(this.props);
        params.offset = this.props.feedOffset || 8;
        this.props.getFeed(clientId, { ...params, add: true });
      }
    }, 100);

  }

  loadFeed() {
    const clientId = getClientId();
    const { tags, limit, offset } = this.props;
    let feedLimit = this.state.feedLimit || 5;
    this.props.setProperty('posts.feedLimit', feedLimit + 5);
  }

  componentDidMount(props) {

    const clientId = getClientId();
    this.props.getGeolocation();
    this.props.getFeed(clientId, getParams(this.props));

  }

  componentDidUpdate(prevProps) {

    const prevCheckIn = prevProps.savedCheckIn;
    const checkIn = this.props.savedCheckIn;

    const prevPost = prevProps.savedPost;
    const post = this.props.savedPost;

    const prevTerminal = prevProps.savedTerminal;
    const terminal = this.props.savedTerminal;

    const prevDelCheckIn = prevProps.deletedCheckIn;
    const delCheckIn = this.props.deletedCheckIn;

    const clientId = getClientId();
    const params = getParams(this.props);

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

    if (post) {
      if (!prevPost || prevPost.saved !== post.saved) {
        console.log("post added");
        this.props.setProperty('posts.postText', '');
        this.props.setProperty('posts.mediaItems', []);
        this.props.getFeed(clientId, params);
      }
    }

    if (terminal) {
      if (!prevTerminal || prevTerminal.saved !== terminal.saved) {
        this.props.setProperty('posts.addType', terminal.type);
        this.props.setProperty('editTerminal.terminalProperties', null);
        this.props.getFeed(clientId, params);
      }
    }

    /*
    const feedLimit = this.props.feedLimit;
    const prevLimit = prevProps.feedLimit;
    const feedOffset = this.props.feedOffset;
    const prevOffset = prevProps.feedOffset;

    if (feedOffset !== prevOffset) {
      params.offset = feedOffset;
      this.props.getFeed(clientId, { ...params, add: true });
    }
    */

  }

  render() {

    this.context.setTitle(title);

    const { feed, transportTypes } = this.props;

    return (
      <div>
        <div className={s.root}>
          <HomeView feed={feed} transportTypes={transportTypes} />
        </div>
        {
          <div className={s.windowStats}>
            Loading posts {(this.props.feedOffset || 0) + 1} - {(this.props.feedOffset || 0) + 1 + 8}...
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
  savedTerminal: state.posts.savedTerminal,
  feedOffset: state.posts.feedOffset,
  feedLimit: state.posts.feedLimit,
  loadingFeed: state.posts.loadingFeed,
  loadFeedOffset: state.posts.loadFeedOffset
}), {
  getGeolocation,
  getFeed,
  setProperty
})(withStyles(s)(Home));
