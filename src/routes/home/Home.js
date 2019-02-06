import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import HomeView from '../../components/Home';

import { connect } from "react-redux";
import { getGeolocation } from "../../actions/global";
import { getFeed } from "../../actions/posts";
import { setProperty } from "../../actions/properties";

const title = 'Transitlinks';

class Home extends React.Component {

  componentDidMount(props) {
    this.props.getGeolocation();
  }

  componentDidUpdate(prevProps) {

    const prevCheckIn = prevProps.savedCheckIn;
    const checkIn = this.props.savedCheckIn;

    const prevPost = prevProps.savedPost;
    const post = this.props.savedPost;

    if (checkIn) {
      if (!prevCheckIn || prevCheckIn.saved !== checkIn.saved) {
        this.props.getFeed();
      }
    }

    if (post) {
      if (!prevPost || prevPost.saved !== post.saved) {
        this.props.setProperty('add.postText', '');
        this.props.getFeed();
      }
    }

  }

  render() {

    this.context.setTitle(title);

    const { feed } = this.props;

    return (
      <div className={s.root}>
        <HomeView feed={feed} />
      </div>
    );
  }
}

Home.propTypes = {
};
Home.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  savedCheckIn: state.posts.checkIn,
  savedPost: state.posts.post
}), {
  getGeolocation,
  getFeed,
  setProperty
})(withStyles(s)(Home));
