import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import { FormattedRelative } from 'react-intl';

const title = 'Transitlinks';

class Home extends React.Component {
 
  render() {
    
    this.context.setTitle(title);
    
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>Transitlinks !</h1>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
};
Home.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Home);
