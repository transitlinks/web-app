import React from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FunctionBar.css';
import cx from 'classnames';
import FontIcon from 'material-ui/FontIcon';
import LinkSearchInput from '../LinkSearch/LinkSearchInput';
import Link from '../Link';
import msg from './messages';

const FunctionBar = ({
  links, showLinks
}) => {

  return (
    <div className={s.container}>
      <div className={s.search}>
        <FontIcon className={cx(s.searchIcon, "material-icons")}>search</FontIcon>
        <div className={s.searchField}>
          <LinkSearchInput />
        </div>
      </div>
      <div className={s.createLink}>
        <Link to="/link-instance">
          <FormattedMessage {...msg.newLink} />
        </Link>
      </div>
    </div>
  );

};

export default connect(
  state => ({
    links: state.searchLinks.links
  }), {
  }
)(withStyles(s)(FunctionBar));
