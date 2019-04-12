import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Discover.css';
import DiscoverView from '../../components/Discover';

const title = 'Transitlinks - Discover';

class Discover extends React.Component {

  render() {  

    const { context, props } = this;
    const { discoveries } = props;

    context.setTitle(title);

    return (
      
      <div>
        <div className={s.root}>
          <div className={s.container}>
            <DiscoverView discoveries={discoveries}>
            </DiscoverView>
          </div>
        </div>
      </div>    
    
    );

  }

};

Discover.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Discover);
