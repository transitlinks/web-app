import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LinkSearch.css';
import FontIcon from 'material-ui/FontIcon';
import Link from '../Link';
import LinkSearchInput from './LinkSearchInput';
import TransitLink from './TransitLink';
import msg from './messages';

const LinkSearch = ({
  links, navigate
}) => {

  
  const linkResults = (links && links.length > 0) ? 
    links.map(link => <TransitLink link={link} />) :
    (
      <div className={s.noResults}>
        <div>
          We don't have any links matching your search. If you find out how to get there, do share it with us!
        </div>
        <div>
          <Link to="/link-instance">
            <FormattedMessage {...msg.newLink} />
          </Link>
        </div>
      </div>
    );
  
  return (
    <div className={s.container}>
      <div className={s.header}>
      </div>
      <div className={s.results}>
        {linkResults}
      </div>
    </div>
  );
};

export default connect(state => ({
  links: state.searchLinks.links
}), {
  navigate
})(withStyles(s)(LinkSearch));
