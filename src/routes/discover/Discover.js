import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Discover.css';
import DiscoverView from '../../components/Discover';
import { getDiscoveries } from '../../actions/discover';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import debounce from 'lodash.debounce';

const title = 'Transitlinks - Discover';

class Discover extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {

    const { search, type, offset, localityOffset, tagOffset, userOffset } = this.props;

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
        const { search, type, offset, localityOffset, tagOffset, userOffset } = this.props;
        console.log('debounce search', this.props, this.props.offset, this.state.prevOffset, userOffset);
        if (this.state.prevOffset !== offset) {
          this.setState({ prevOffset: offset });
          this.props.getDiscoveries({ search, type, offset: offset || 0, localityOffset, tagOffset, userOffset, limit: 6 });
        }
      }
    }, 100);

    this.props.getDiscoveries({ search, type, offset: offset || 0, localityOffset, tagOffset, userOffset, limit: 6 });

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
  userOffset: state.discover.userOffset,
  limit: state.discover.limit,
  search: state.discover.searchTerm,
  loadingDiscover: state.discover.loadingDiscover
}), {
  getDiscoveries,
  setProperty
})(withStyles(s)(Discover));

