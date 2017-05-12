import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Home.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const HomeView = ({ intl }) => {	
  
	return (
    <div className={s.container}>
      <div className={s.brand}>
        <div className={s.appName}>Transitlinks</div>
        <div className={s.appShortDescription}>Universal transit resource</div>
      </div>
      <div className={s.about}>Find transit connections anywhere in the world by any mode of transport.</div>
      <div className={s.breakdown}>
        <div className={s.item}>
          <div className={s.header}>
            <div className={s.title}>
              Find
            </div>
          </div>
          <div className={s.body}>
          </div>
        </div>
        <div className={s.item}>
          <div className={s.header}>
            <div className={s.title}>
              Contribute
            </div>
          </div>
          <div className={s.body}>
          </div>
        </div>
        <div className={s.item}>
          <div className={s.header}>
            <div className={s.title}>
              Plan
            </div>
          </div>
          <div className={s.body}>
          </div>
        </div>
        <div className={s.item}>
          <div className={s.header}>
            <div className={s.title}>
              Share
            </div>
          </div>
          <div className={s.body}>
          </div>
        </div>
      </div>
    </div>
  );

}; 

HomeView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(HomeView))
);
