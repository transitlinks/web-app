import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditTabs.css';
import cx from 'classnames';
import FontIcon from 'material-ui/FontIcon';
import Chip from 'material-ui/Chip';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const EditTabs = ({
  intl, children, selection, navigate
}) => {

  return (
    <div className={s.container}>
      <div className={s.tabs}>
        <div className={s.tab}>
          {
            selection === 'linkInstance' ?
            <Chip>Link</Chip> :
            <a onClick={() => navigate('/link-instance')}>Link</a>
          }
        </div>
        <div className={s.tab}>
          {
            selection === 'trip' ?
            <Chip>Trip</Chip> :
            <a onClick={() => navigate('/trip')}>Trip</a>
          }
        </div>
        {
          false &&
          <div className={s.tab}>
            {
              selection === 'location' ?
              <Chip>Location</Chip> :
              <a onClick={() => navigate('/location')}>Location</a>
            }
          </div>
        }
      </div>
      <div className={s.tabContent}>
        {children}
      </div>
    </div>
  );
}

EditTabs.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
  }), {
    navigate
  })(withStyles(s)(EditTabs))
);
