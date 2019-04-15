import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Discover.css';
import DiscoverView from '../../components/Discover';
import FunctionBar from '../../components/FunctionBar';

const title = 'Transitlinks - Discover';

class Discover extends React.Component {

  render() {  

    const { context, props } = this;
    const { discover } = props;

    context.setTitle(title);

    return (
      
      <div>
        <div className={s.root}>
          <div className={s.container}>
            <div className={s.functionBar}>
              <FunctionBar />
            </div>
            <DiscoverView discover={discover}>
            </DiscoverView>
          </div>
        </div>
      </div>    
    
    );

  }

};

Discover.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Discover);
