import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Account.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const AccountView = ({ children, section, intl }) => {

	return (
    <div className={s.container}>
      <div className={s.logOut}>
        <RaisedButton label={intl.formatMessage(msg['logout'])}
                      primary={true}
                      onClick={() => { location.href = "/logout" }} />
      </div>
      <div className={s.sectionLinks}>
        <div className={cx(s.sectionLink, (section === 'profile') ? s.selected : null)}>
          <Link to="/account/profile">
            <FormattedMessage {...msg['profile-link']} />
          </Link>
        </div>
        <div className={cx(s.sectionLink, (section === 'links') ? s.selected : null)}>
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
