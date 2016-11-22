import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Account.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const AccountView = ({ children, intl }) => {	
	
	return (
    <div className={s.container}>
      <div className={s.sectionLinks}>
        <div className={s.sectionLink}>
          <Link to="/account/profile">
            <FormattedMessage {...msg['profile-link']} />
          </Link>
        </div>
        <div className={s.sectionLink}>
          <Link to="/account/links"> 
            <FormattedMessage {...msg['links-link']} />
          </Link>
        </div>
      </div>
      <div className={s.sectionContent}>
        {children}
      </div>
    </div>
  );

}; 

AccountView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(AccountView))
);
