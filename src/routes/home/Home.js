import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import HomeView from '../../components/Home';

import { connect } from "react-redux";
import { getGeolocation } from "../../actions/global";
import { getFeed } from "../../actions/posts";
import { setProperty } from "../../actions/properties";
import {getClientId} from "../../core/utils";

const title = 'Transitlinks';

class Home extends React.Component {

  componentDidMount(props) {
    this.props.getGeolocation();
    this.props.getFeed();
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

    if (checkIn) {
      if (!prevCheckIn || prevCheckIn.saved !== checkIn.saved) {
        this.props.getFeed(clientId);
      }
    }

    if (delCheckIn) {
      if (!prevDelCheckIn || prevDelCheckIn.deleted !== delCheckIn.deleted) {
        this.props.getFeed(clientId);
      }
    }

    if (post) {
      if (!prevPost || prevPost.saved !== post.saved) {
        this.props.setProperty('posts.postText', '');
        this.props.getFeed(clientId);
      }
    }

    if (terminal) {
      if (!prevTerminal || prevTerminal.saved !== terminal.saved) {
        this.props.setProperty('posts.addType', null);
        this.props.setProperty('editTerminal.terminalProperties', null);
        this.props.getFeed(clientId);
      }
    }

  }

  render() {

    this.context.setTitle(title);

    const { feed, transportTypes } = this.props;

    return (
      <div className={s.root}>
        <HomeView feed={feed} transportTypes={transportTypes} />
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
  savedTerminal: state.posts.savedTerminal
}), {
  getGeolocation,
  getFeed,
  setProperty
})(withStyles(s)(Home));
