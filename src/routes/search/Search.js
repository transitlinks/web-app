import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Search.css';
import LinkSearch from '../../components/LinkSearch';
import { FormattedRelative } from 'react-intl';

const title = 'Transitlinks - Search';

class Search extends React.Component {

  render() {
    
    this.context.setTitle(title);
    const links = this.props.links;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1 className={s.title}>Search</h1>
          <LinkSearch />
          <ul className={s.news}>
            {links.map((link, index) => (
              <li key={index} className={s.newsItem}>
                <span className={s.newsTitle}>
                  <span>{link.from.name}</span>
                  <span> -> </span>
                  <span>{link.to.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

  }

}

Search.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.object,
    to: PropTypes.object
  })).isRequired,
};
Search.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Search);
