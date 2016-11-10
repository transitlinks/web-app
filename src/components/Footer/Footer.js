import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Footer.css';
import Link from '../Link';

function Footer() {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <span className={s.text}>© Transitlinks</span>
        <span className={s.spacer}>·</span>
        <Link className={s.link} to="/">Home</Link>
        <span className={s.spacer}>·</span>
        <Link className={s.link} to="/privacy">Privacy</Link>
        <span className={s.browserstack}>
          Tested with
          <a href="http://www.browserstack.com/">
            <img src={require("./browserstack.png")} />
          </a>
        </span>
      </div>
    </div>
  );
}

export default withStyles(s)(Footer);
