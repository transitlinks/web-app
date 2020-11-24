import React, { Component, PropTypes } from 'react';
import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './App.css';
import Header from '../Header';
import Footer from '../Footer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { connect } from 'react-redux';
import { getLastCoords } from '../../actions/global';
import { setProperty } from '../../actions/properties';
import { getActiveTrip, saveTripCoord } from '../../actions/trips';
import { updateLastCoords } from '../../services/linkService';
import { isMobile } from '../utils';

class App extends Component {

  static propTypes = {
    context: PropTypes.shape({
      createHref: PropTypes.func.isRequired,
      store: PropTypes.object.isRequired,
      insertCss: PropTypes.func,
      setTitle: PropTypes.func,
      setMeta: PropTypes.func
    }).isRequired,
    children: PropTypes.element.isRequired,
    error: PropTypes.object,
  };

  static childContextTypes = {
    createHref: PropTypes.func.isRequired,
    insertCss: PropTypes.func.isRequired,
    setTitle: PropTypes.func.isRequired,
    setMeta: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      lastCoordsUpdatedAt: 0
    };
  }

  getChildContext() {
    const context = this.props.context;
    return {
      createHref: context.createHref,
      insertCss: context.insertCss || emptyFunction,
      setTitle: context.setTitle || emptyFunction,
      setMeta: context.setMeta || emptyFunction
    };
  }

  componentWillMount() {
    const { insertCss } = this.props.context;
    this.removeCss = insertCss(s);
  }

  componentDidMount() {

    if (!isMobile()) return;

    let hidden;
    let visibilityChange;
    if (typeof document.hidden !== 'undefined') {
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    const handleVisibilityChange = () => {
      if (!document[hidden]) {
        const now = (new Date()).toISOString();
        this.setState({ lastVisibility: now });
        this.props.getLastCoords();
        this.props.getActiveTrip();
      }
    };

    if (typeof document.addEventListener === 'undefined' || hidden === undefined) {
      console.log('Page Visibility API not supported. Automatic trip coordinate saving not enabled.');
    } else {
      document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }

    this.props.getLastCoords();
    this.props.getActiveTrip();

  }

  componentDidUpdate() {

    if (!isMobile()) return;
    
    const lastCoords = this.props.lastCoords;
    const activeTrip = this.props.activeTrip;
    const lastCoordsUpdatedDiff = (new Date()).getTime() - this.state.lastCoordsUpdatedAt;
    if (lastCoordsUpdatedDiff > 60000 && activeTrip && lastCoords) {
      this.setState({ lastCoordsUpdatedAt: (new Date()).getTime() });
      this.props.saveTripCoord({
        latitude: lastCoords.latitude,
        longitude: lastCoords.longitude,
      });
    }

  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {

    if (this.props.error) {
      return this.props.children;
    }

    const store = this.props.context.store;
    const userAgent = store ?
      store.getState().runtime.userAgent : 'all';

    return (

      <MuiThemeProvider muiTheme={getMuiTheme({}, { userAgent })}>
        <div>
          <Header />
          {this.props.children}
          <Footer />
        </div>
      </MuiThemeProvider>
    );

  }

}

export default connect(state => ({
  activeTrip: state.trips.activeTrip,
  deletedTrip: state.trips.deletedTrip,
  savedTrip: state.trips.savedTrip,
  lastCoords: state.global['geolocation.lastCoords'],
  lastCoordsReceivedAt: state.global['geolocation.lastCoordsReceivedAt']
}), {
  setProperty,
  saveTripCoord,
  getLastCoords,
  getActiveTrip
})(App);
