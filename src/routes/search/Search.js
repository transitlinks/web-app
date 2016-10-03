import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Search.css';
import LinkSearch from '../../components/LinkSearch';
import { FormattedRelative } from 'react-intl';

const title = 'Transitlinks - Search';

class Search extends React.Component {

  render() {
    
    this.context.setTitle(title);
    
    return (
      <div className={s.root}>
        <div className={s.container}>
          <LinkSearch />
        </div>
      </div>
    );

  }

}

Search.propTypes = {
};
Search.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Search);
