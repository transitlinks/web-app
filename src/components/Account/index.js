import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Account.css';

import { injectIntl } from 'react-intl';
import msg from './messages';

const AccountView = ({ children, intl }) => {

	return (
    <div className={s.container}>
      <div className={s.logOut}>
        <RaisedButton id="logout-button" label={intl.formatMessage(msg['logout'])}
                      primary={true}
                      onClick={() => { location.href = "/auth/logout" }} />
      </div>
      <div className={s.sectionLinks}>
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
