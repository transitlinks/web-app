import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Login.css';
import LoginView from '../../components/Login';

const title = 'Transitlinks - Log In';

class Login extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    window.gtag('config', 'G-WJY0GVR87Z', {
      page_path: window.location.pathname,
    });
  }

  render() {

    this.context.setTitle(title);

    const errorElem = null;

    return (

      <div>
        <div className={s.root}>
          {errorElem}
          <div className={s.container}>
            <LoginView />
          </div>
        </div>
      </div>

    );

  }


};

Login.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Login);
