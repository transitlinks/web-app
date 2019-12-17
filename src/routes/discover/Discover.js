import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Discover.css';
import DiscoverView from '../../components/Discover';
import FunctionBar from '../../components/FunctionBar';
import { getDiscoveries } from "../../actions/discover";
import {connect} from "react-redux";
import {getGeolocation} from "../../actions/global";
import {getFeed} from "../../actions/posts";
import {setProperty} from "../../actions/properties";
import {getClientId} from "../../core/utils";
import debounce from "lodash.debounce";

const title = 'Transitlinks - Discover';

const getParams = (props) => {
  const { limit, offset } = props;
  const params = {};
  if (limit) params.limit = 6;
  if (offset) params.offset = offset;
  return params;
};

class Discover extends React.Component {

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
        const { search, type, offset, limit } = this.props;
        this.props.getDiscoveries(search, type, offset || 0, limit || 1);
      }
    }, 100);

  }

  componentDidMount(props) {
    const { search, type, offset, limit } = this.props;
    this.props.getDiscoveries(search, type, offset || 0, limit || 1);
  }

  render() {

    const { context, props } = this;
    const { discover, transportTypes } = props;

    context.setTitle(title);

    return (

      <div>
        <div className={s.root}>
          <div className={s.container}>
            <div className={s.functionBar}>
              <FunctionBar />
            </div>
            <DiscoverView discover={discover} transportTypes={transportTypes} >
            </DiscoverView>
            {
              <div className={s.windowStats}>
                Loading discoveries {(this.props.discoverOffset || 0) + 1} - {(this.props.discoverOffset || 0) + 1 + 6}...
              </div>
            }
          </div>
        </div>
      </div>

    );

  }

};

Discover.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  discoverOffset: state.discover.discoverOffset,
  discoverLimit: state.discover.discoverLimit,
  loadingDiscover: state.discover.loadingDiscover,
  loadDiscoverOffset: state.discover.loadDiscoverOffset
}), {
  getDiscoveries,
  setProperty
})(withStyles(s)(Discover));

