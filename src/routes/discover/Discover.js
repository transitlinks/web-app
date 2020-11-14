import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Discover.css';
import DiscoverView from '../../components/Discover';
import { getDiscoveries } from '../../actions/discover';
import { getFeedItem } from '../../actions/checkIns';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import debounce from 'lodash.debounce';
import { saveTripCoord } from '../../actions/trips';
import { getLastCoords } from '../../actions/global';
import { updateLastCoords } from '../../services/linkService';

const title = 'Transitlinks - Discover';

class Discover extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {


    this.props.setProperty('posts.checkIn', null);

    const { search, type, offset, localityOffset, tagOffset, tripOffset, userOffset } = this.props;

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
        const { search, type, offset, localityOffset, tagOffset, tripOffset, userOffset } = this.props;
        console.log('debounce search', this.props, this.props.offset, this.state.prevOffset, userOffset);
        if (this.state.prevOffset !== offset) {
          this.setState({ prevOffset: offset });
          this.props.getDiscoveries({ search, type, offset: offset || 0, localityOffset, tagOffset, tripOffset, userOffset, limit: 6 });
        }
      }
    }, 100);

    this.props.getDiscoveries({ search, type, offset: offset || 0, localityOffset, tagOffset, tripOffset, userOffset, limit: 6 });

  }

  componentDidUpdate(prevProps) {

    const { savedComment, deletedComment } = this.props;

    if (this.props.activeTrip) {
      updateLastCoords(this.props.lastCoords, prevProps.lastCoords, this.props.saveTripCoord, this.props.getLastCoords);
    }

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

    const { savedLike } = this.props;
    if (savedLike) {
      this.props.setProperty('posts.savedLike', null);
      if (savedLike.checkInUuid) {
        this.props.getFeedItem(savedLike.checkInUuid, savedLike.frameId, true);
      }
    }

  }

  render() {

    const { context, props } = this;
    const { discover, transportTypes } = props;

    context.setTitle(title);

    return (

      <div>
        <div className={s.root}>
          <div className={s.container}>
            <DiscoverView discover={discover} transportTypes={transportTypes} >
            </DiscoverView>
            {
              this.props.loadingDiscover &&
              <div className={s.windowStats}>
                Loading discoveries {(this.props.offset || 0) + 1} - {(this.props.offset || 0) + 1 + 6}...
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
  offset: state.discover.offset,
  localityOffset: state.discover.localityOffset,
  tagOffset: state.discover.tagOffset,
  tripOffset: state.discover.tripOffset,
  userOffset: state.discover.userOffset,
  limit: state.discover.limit,
  search: state.discover.searchTerm,
  loadingDiscover: state.discover.loadingDiscover,
  savedComment: state.posts.savedComment,
  deletedComment: state.posts.deletedComment,
  savedLike: state.posts.savedLike,
  lastCoords: state.global['geolocation.lastCoords']
}), {
  getDiscoveries,
  setProperty,
  getFeedItem,
  saveTripCoord,
  getLastCoords
})(withStyles(s)(Discover));

