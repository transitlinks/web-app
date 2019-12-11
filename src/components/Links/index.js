import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Links.css';
import { getLinks } from '../../actions/links';
import { setProperty } from '../../actions/properties';

import { injectIntl, FormattedMessage } from 'react-intl';
import msgTransport from '../common/messages/transport';
import FunctionBar from "../FunctionBar";
import { GoogleMap, Marker, Polyline, withGoogleMap } from 'react-google-maps';

const LinksMap = withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={12}
    defaultCenter={{...props.latLng}}
    onClick={props.onMapClick}>
    {
      (props.links || []).map(link => {

        const strokeColor = '#FF0000';
        return <Polyline path={[
          { lat: link.from.latitude, lng: link.from.longitude },
          { lat: link.to.latitude, lng: link.to.longitude }
        ]} options={{
          geodesic: true,
          strokeColor,
          strokeOpacity: 1.0,
          strokeWeight: 2
        }} />;
      })
    }
  </GoogleMap>
));

const LinksView = ({ links, loadedLinks, viewMode, transportTypes, getLinks, setProperty }) => {

  let  displayLinks = (loadedLinks || links) || [];

  const getSearchParams = (input) => {
    return { locality: input };
  };

  const listView = (
    <div>
      {

        (displayLinks || []).map((link, index) => {

          const { uuid } = link;
          return (
            <div key={uuid} className={s.linkItem}>
              <div className={s.row1}>
                <div className={s.transport}>
                  <FormattedMessage { ...msgTransport[link.transport] } />
                </div>
                <div className={s.transportId}>
                  {link.transportId}
                </div>
              </div>
              <div className={s.row2}>
                <div className={s.from}>
                  <b>From:</b> { link.from.formattedAddress }
                </div>
                <div className={s.to}>
                  <b>To:</b> { link.to.formattedAddress }
                </div>
              </div>
            </div>
          );

        })
      }
    </div>
  );

  let defaultCenter = {
    lat: 60.16952,
    lng: 24.93545
  };

  if (displayLinks.length > 0) {
    defaultCenter = {
      lat: displayLinks[0].from.latitude,
      lng: displayLinks[0].from.longitude
    }
  }

  console.log('display links', displayLinks);

  const mapView = (
    <div>
      <LinksMap
        containerElement={
          <div style={{ height: `400px` }} />
        }
        mapElement={
          <div style={{ height: `100%` }} />
        }
        latLng={defaultCenter}
        onMapLoad={() => {
          console.log('map loaded');
        }}
        onMapClick={() => {
          console.log('map clicked');
        }}
        links={displayLinks}
      />
    </div>
  );

  return (
    <div className={s.container}>
      <div className={s.functionBar}>
        <div className={s.searchFieldContainer}>
          <FunctionBar getParams={getSearchParams} performSearch={getLinks} />
        </div>
        <div className={s.mapToggle}>
          {
            (viewMode === 'map') ?
              <FontIcon className="material-icons" style={{ fontSize: '24px' }}
                        onClick={() => setProperty('links.viewMode', 'list')}>list</FontIcon> :
              <FontIcon className="material-icons" style={{ fontSize: '24px' }}
                        onClick={() => setProperty('links.viewMode', 'map')}>map</FontIcon>
          }
        </div>
      </div>
      {
        (viewMode === 'map') ? mapView : listView
      }
    </div>
  );

};

LinksView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => {
    return {
      loadedLinks: state.links.transitLinks,
      fetchedFeedItems: state.posts.fetchedFeedItems || {},
      feedUpdated: state.posts.feedUpdated,
      viewMode: state.links.viewMode
    }
  }, {
    getLinks,
    setProperty
  })(withStyles(s)(LinksView))
);
