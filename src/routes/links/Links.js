import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Links.css';
import LinksView from '../../components/Links';
import FunctionBar from '../../components/FunctionBar';
import { getLinks } from "../../actions/links";
import {connect} from "react-redux";
import {setProperty} from "../../actions/properties";

const title = 'Transitlinks - Discover';

class Links extends React.Component {


  componentDidMount(props) {
    console.log("links props", this.props);
    this.props.getLinks(this.props.params);
  }

  render() {

    const { context, props } = this;
    const { links, transportTypes } = props;

    context.setTitle(title);



    return (

      <div>
        <div className={s.root}>
          <div className={s.container}>
            <LinksView links={links} transportTypes={transportTypes} >
            </LinksView>
          </div>
        </div>
      </div>

    );

  }

};

Links.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
}), {
  getLinks,
  setProperty
})(withStyles(s)(Links));

