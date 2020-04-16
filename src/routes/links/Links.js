import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Links.css';
import LinksView from '../../components/Links';
import { getLinks, setZoomLevel } from "../../actions/links";
import { connect } from "react-redux";
import { setProperty } from "../../actions/properties";

const title = 'Transitlinks - Discover';

class Links extends React.Component {


  componentDidMount() {
    console.log('links props', this.props);
    const { query } = this.props;
    this.props.getLinks(query || {});
  }

  componentDidUpdate(prevProps) {

    const { loadedLinks, mapRef, query } = this.props;
    console.log('loaded links', loadedLinks, mapRef);
    if (loadedLinks) {
      this.props.setZoomLevel(loadedLinks, this.props.linkMode);
    }

    const prevQuery = prevProps.query;
    if ((!prevQuery && query.locality) || (prevQuery && query.locality && prevQuery.locality !== query.locality)) {
      this.props.setProperty('links.selectedLink', null);
      this.props.getLinks({ locality: query.locality });
    }

  }

  render() {

    const { context, props } = this;
    const { links, transportTypes, query } = props;

    context.setTitle(title);



    return (

      <div>
        <div className={s.root}>
          <div className={s.container}>
            <LinksView links={links} query={query} transportTypes={transportTypes} >
            </LinksView>
          </div>
        </div>
      </div>

    );

  }

};

Links.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  loadedLinks: state.links.transitLinks,
  linkMode: state.links.linkMode
}), {
  getLinks,
  setProperty,
  setZoomLevel
})(withStyles(s)(Links));

