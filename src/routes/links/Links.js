import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Links.css';
import LinksView from '../../components/Links';
import { getLinks, setZoomLevel } from "../../actions/links";
import { connect } from "react-redux";
import { setProperty } from "../../actions/properties";
import { getMapBounds, updateLastCoords } from '../../services/linkService';
import { saveTripCoord } from '../../actions/trips';
import { getLastCoords } from '../../actions/global';

const title = 'Transitlinks - Discover';

class Links extends React.Component {


  componentDidMount() {
    const { query } = this.props;
    this.props.setProperty('links.selectedLink', null);
  }

  componentDidUpdate(prevProps) {

    const { query } = this.props;
    const prevQuery = prevProps.query;

    const linksResult = this.props.linksResult || this.props.loadedLinksResult;
    const prevLinksResult = prevProps.linksResult || prevProps.loadedLinksResult;

    if (this.props.activeTrip) {
      updateLastCoords(this.props.lastCoords, prevProps.lastCoords, this.props.saveTripCoord, this.props.getLastCoords);
    }

    if (query.locality) {
      this.props.setProperty('links.selectedLocality', query.locality);
      this.props.setProperty('links.searchTerm', '');
    } else {
      this.props.setProperty('links.selectedLocality', null);
    }

    if (query.linkedLocality) {
      this.props.setProperty('links.selectedLinkedLocality', query.linkedLocality);
    } else {
      this.props.setProperty('links.selectedLinkedLocality', null);
    }

    if (query.transportTypes) {
      this.props.setProperty('links.selectedTransportTypes', query.transportTypes.split(','));
    } else {
      this.props.setProperty('links.selectedTransportTypes', []);
    }

    if (query.tag) {
      this.props.setProperty('links.selectedTag', query.tag);
      this.props.setProperty('links.selectedLocality', null);
      this.props.setProperty('links.selectedLinkedLocality', null);
      this.props.setProperty('links.searchTerm', '');
    } else {
      this.props.setProperty('links.selectedTag', null);
    }

    if (query.search) {
      this.props.setProperty('links.searchTerm', query.search);
      this.props.setProperty('links.selectedLocality', null);
      this.props.setProperty('links.selectedLinkedLocality', null);
    } else {
      this.props.setProperty('links.searchTerm', '');
    }


    const selectedRouteLinks = this.props.selectedRouteLinks;
    const prevSelectedRouteLinks = prevProps.selectedRouteLinks;

    const loadedLinks = linksResult.links || [];

    const mb = getMapBounds(loadedLinks, this.props.linkMode);
    const ne = mb.getNorthEast();
    const sw = mb.getSouthWest();
    const mapBoundsHash = ne.lng() + ne.lat() + sw.lng() + sw.lat();

    if (selectedRouteLinks && (!prevSelectedRouteLinks || selectedRouteLinks.routeId !== prevSelectedRouteLinks.routeId)) {
      this.props.setZoomLevel({ departures: selectedRouteLinks.terminals }, this.props.linkMode);
    } else if (
      this.props.viewMode !== prevProps.viewMode ||
      this.props.locality !== prevProps.locality ||
      this.props.linkedLocality !== prevProps.linkedLocality ||
      this.props.mapBoundsHash !== mapBoundsHash) {
        console.log('set zoom level', loadedLinks);
        this.props.setProperty('links.mapBoundsHash', mapBoundsHash);
        this.props.setZoomLevel(loadedLinks, this.props.linkMode);
    }

    const selectedTerminal = this.props.selectedTerminal;
    const prevSelectedTerminal = prevProps.selectedTerminal;
    if (selectedTerminal) {
      if (!prevSelectedTerminal || selectedTerminal.uuid !== prevSelectedTerminal.uuid) {
        this.props.setZoomLevel([
          { departures: [selectedTerminal] }
        ], this.props.linkMode);
      }
    } else {
      if (prevSelectedTerminal) {
        this.props.setZoomLevel(loadedLinks, this.props.linkMode);
      }
    }

  }

  render() {

    const { context, props } = this;
    const { linksResult, transportTypes, query, updated } = props;

    context.setTitle(title);

    return (

      <div>
        <div className={s.root}>
          <div className={s.container}>
            <LinksView updated={updated} linksResult={linksResult} query={query} transportTypes={transportTypes} >
            </LinksView>
          </div>
        </div>
      </div>

    );

  }

};

Links.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  loadedLinksResult: state.links.transitLinks,
  selectedLink: state.links.selectedLink,
  selectedTerminal: state.links.selectedTerminal,
  selectedRouteLinks: state.links.selectedRouteLinks,
  displayLinks: state.links.displayLinks,
  locality: state.links.selectedLocality,
  linkedLocality: state.links.selectedLinkedLocality,
  linkMode: state.links.linkMode,
  mapZoom: state.links.mapZoom,
  mapBoundsHash: state.links.mapBoundsHash,
  viewMode: state.links.viewMode,
  lastCoords: state.global['geolocation.lastCoords']
}), {
  getLinks,
  setProperty,
  setZoomLevel,
  saveTripCoord,
  getLastCoords
})(withStyles(s)(Links));

