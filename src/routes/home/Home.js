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
  console.log('props', props);
  const { tags, offset } = props;
  const params = { limit: 8, offset: offset || 0 };
  if (tags) params.tags = tags;
  return params;
};

class Home extends React.Component {

  constructor(props) {

    super(props);

    this.state = {};

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
        const clientId = getClientId();
        const params = getParams(this.props);
        console.log('get feed', params);
        this.props.getFeed(clientId, { ...params, add: true });
      }
    }, 100);

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
          this.props.loadingFeed &&
          <div className={s.windowStats}>
            Loading posts {(this.props.offset || 0) + 1} - {(this.props.offset || 0) + 1 + 8}...
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
  offset: state.posts.feedOffset,
  loadingFeed: state.posts.loadingFeed,
  loadFeedOffset: state.posts.loadFeedOffset
}), {
  getGeolocation,
  getFeed,
  setProperty
})(withStyles(s)(Home));
