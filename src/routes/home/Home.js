import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
//import HomeView from '../../components/Home';
import FeedView from '../../components/Feed';

import { FormattedRelative } from 'react-intl';

const title = 'Transitlinks';

class Home extends React.Component {
 
  render() {
    
    this.context.setTitle(title);

    const { posts } = this.props;

    return (
      <div className={s.root}>
        <FeedView posts={posts.posts} />
      </div>
    );
  }
}

Home.propTypes = {
};
Home.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Home);
