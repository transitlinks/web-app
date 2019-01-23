import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Account.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const AddView = ({ children, type, intl }) => {

	return (
    <div className={s.container}>
      <div className={s.sectionLinks}>
        <div className={cx(s.sectionLink, (type === 'place') ? s.selected : null)}>
          <Link to="/add/place">
            <FormattedMessage {...msg['place-link']} />
          </Link>
        </div>
        <div className={cx(s.sectionLink, (type === 'link') ? s.selected : null)}>
          <Link to="/add/link">
            <FormattedMessage {...msg['link-link']} />
          </Link>
        </div>
      </div>
      <div className={s.sectionContent}>
        {children}
      </div>
    </div>
  );

};

AddView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(AddView))
);
