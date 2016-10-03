import React from 'react';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LinkSearch.css';
import FontIcon from 'material-ui/FontIcon';
import LinkSearchInput from './LinkSearchInput';

const LinkSearch = ({
  links, navigate
}) => {

  
  const linkResults = (links || []).map(link => (
    <div key={link.id}
      className={s.link} onClick={() => navigate('/link/' + link.id)}>
      <span id="place-from">{link.from.name}</span>
      <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
      <span id="place-to">{link.to.name}</span>
    </div>
  ));
  
  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          Search links
        </div>
      </div>
      <div>
        <LinkSearchInput />
      </div>
      <div>
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
