import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import HomeView from '../../components/Home';

import { connect } from "react-redux";
import { getGeolocation } from "../../actions/global";
import { getCheckIns } from "../../actions/posts";

const title = 'Transitlinks';

class Home extends React.Component {

  componentDidMount(props) {
    this.props.getGeolocation();
  }

  componentDidUpdate(prevProps) {

    const prevCheckIn = prevProps.savedCheckIn;
    const checkIn = this.props.savedCheckIn;

    if (checkIn) {
      if (!prevCheckIn || prevCheckIn.saved !== checkIn.saved) {
        this.props.getCheckIns();
      }
    }

  }

  render() {

    this.context.setTitle(title);

    const { checkIns } = this.props;

    return (
      <div className={s.root}>
        <HomeView checkIns={checkIns.checkIns} />
      </div>
    );
  }
}

Home.propTypes = {
};
Home.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  savedCheckIn: state.posts.checkIn
}), {
  getGeolocation,
  getCheckIns
})(withStyles(s)(Home));
