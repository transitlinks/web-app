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

class App extends Component {


  constructor(props) {
    super(props);
    this.state = {};
  }

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

  componentWillUnmount() {
    this.removeCss();
  }

  componentDidMount() {
    console.log('APP COMPONENT MOUNTED');
    let hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }
    console.log('hidden/visChange', hidden, visibilityChange);
    const handleVisibilityChange = () => {
      if (!document[hidden]) {
        const now = (new Date()).toISOString();
        console.log('TXLINKS BECAME VISIBLE ' + now);
        this.setState({ lastVisibility: now });
      }
    };

    if (typeof document.addEventListener === "undefined" || hidden === undefined) {
      console.log('Page Visibility API not supported. Automatic trip coordinate saving not enabled.');
    } else {
      document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
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
          <div>LAST VISIBILITY: {this.state.lastVisibility}</div>
          <Header />
          {this.props.children}
          <Footer />
        </div>
      </MuiThemeProvider>
    );

  }

}

//export default App;

export default connect(state => ({
}), {
  setProperty,
  saveTripCoord,
  getLastCoords,
  getActiveTrip
})(App);
