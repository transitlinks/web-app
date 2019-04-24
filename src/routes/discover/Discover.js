import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Discover.css';
import DiscoverView from '../../components/Discover';
import FunctionBar from '../../components/FunctionBar';
import { getDiscoveries } from "../../actions/discover";
import {connect} from "react-redux";
import {getGeolocation} from "../../actions/global";
import {getFeed} from "../../actions/posts";
import {setProperty} from "../../actions/properties";

const title = 'Transitlinks - Discover';

class Discover extends React.Component {


  componentDidMount(props) {
    this.props.getDiscoveries();
  }

  render() {  

    const { context, props } = this;
    const { discover, transportTypes } = props;

    context.setTitle(title);

    return (
      
      <div>
        <div className={s.root}>
          <div className={s.container}>
            <div className={s.functionBar}>
              <FunctionBar />
            </div>
            <DiscoverView discover={discover} transportTypes={transportTypes} >
            </DiscoverView>
          </div>
        </div>
      </div>    
    
    );

  }

};

Discover.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
}), {
  getDiscoveries,
  setProperty
})(withStyles(s)(Discover));

