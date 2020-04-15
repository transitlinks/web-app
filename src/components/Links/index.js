import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import cx from 'classnames';
import s from './Links.css';
import { getLinks, setZoomLevel } from '../../actions/links';
import { setProperty } from '../../actions/properties';
import { injectIntl, FormattedMessage } from 'react-intl';
import { GoogleMap, OverlayView, Polyline, withGoogleMap } from 'react-google-maps';
import TextField from 'material-ui/TextField';

const LinksMap = compose(
  withProps({
    googleMapURL: 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places',
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withGoogleMap
)((props) => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={props.zoom}
    zoom={props.zoom}
    defaultCenter={props.center}
    center={props.center}
    onClick={props.onMapClick}
    options={{
      streetViewControl: false,
      mapTypeControl: false
    }}>
    { props.content }
  </GoogleMap>
));

const renderLinkStatsOverlays = (linkStats, onSelect) => {
  return (linkStats || []).map(linkStat => {
    return (
      <OverlayView position={{ lat: linkStat.latitude, lng: linkStat.longitude }}
                   mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
        <div className={s.localityOverlay}>
          <div className={s.localityName} onClick={() => onSelect(linkStat.locality)}>
            {linkStat.locality}
          </div>
          <div className={s.localityStats}>
            <span className="material-icons">call_made</span> {linkStat.departures.length}
          </div>
          <div className={s.localityStats}>
            <span className="material-icons">call_received</span> {linkStat.arrivals.length}
          </div>
          <div className={s.localityStats}>
            <span className="material-icons">cached</span> {linkStat.internal.length}
          </div>
        </div>
      </OverlayView>
    );
  });
};

const drawLines = (terminals) => {
  return (terminals || []).map(terminal => {
    const color = terminal.type === 'departure' ? '#FF0000' : '#909090';
    return (
      <Polyline
        path={
          [
            { lat: terminal.latitude, lng: terminal.longitude },
            { lat: terminal.linkedTerminal.latitude, lng: terminal.linkedTerminal.longitude }
          ]
        }
        options={{
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 2
        }} />
    );
  });
};

const renderLinks = (links, linkMode) => {
  return (
      linkMode === 'internal' ?
        drawLines(links.internal) :
        [
          drawLines(links.departures),
          drawLines(links.arrivals)
        ]
  );
};

const LinksView = ({ links, loadedLinks, searchTerm, viewMode, linkMode, mapZoom, getLinks, setProperty }) => {

  let  displayLinks = (loadedLinks || links) || [];

  const listView = (
    <div>
      {

        (displayLinks || []).map((link, index) => {

          const { uuid } = link;
          return (
            <div key={uuid} className={s.linkItem}>
              <div className={s.row1}>
                {link.locality}
              </div>
              <div className={s.row3}>
                Departures: {link.departures.length}
              </div>
              <div className={s.row3}>
                Arrivals: {link.arrivals.length}
              </div>
              <div className={s.row3}>
                Internal: {link.internal.length}
              </div>
            </div>
          );

        })
      }
    </div>
  );

  let mapCenter = {
    lat: 60.16952,
    lng: 24.93545
  };

  if (displayLinks.length > 0) {
    mapCenter = {
      lat: displayLinks[0].latitude,
      lng: displayLinks[0].longitude
    };
  }

  const showControls = displayLinks.length === 1 &&
    (displayLinks[0].departures.length > 0 || displayLinks[0].arrivals > 0) && displayLinks[0].internal.length > 0;
  let actualLinkMode = linkMode;
  if (displayLinks.length === 1 && !showControls) {
    if (displayLinks[0].departures.length > 0 || displayLinks[0].arrivals > 0) {
      actualLinkMode = 'external';
    } else if (displayLinks[0].internal.length > 0) {
      actualLinkMode = 'internal';
    }
  }

  let content = null;
  if (displayLinks.length === 1) {
    content = renderLinks(displayLinks[0], actualLinkMode);
  } else {
    content = renderLinkStatsOverlays(displayLinks, (locality) => {
      setProperty('links.searchTerm', locality);
      setProperty('links.linkMode', 'external');
      getLinks({ locality });
    });
  }

  console.log('default center', mapCenter, mapZoom);

  const mapView = (
    <div>
      {
        showControls &&
        <div className={s.mapControls}>
          <div className={s.selector}>
            <div className={s.selectorElement} style={linkMode === 'external' ? { backgroundColor: '#d0d0d0' } : {}} onClick={() => setProperty('links.linkMode', 'external')}>External</div>
            <div className={s.selectorElement} style={linkMode === 'internal' ? { backgroundColor: '#d0d0d0' } : {}} onClick={() => setProperty('links.linkMode', 'internal')}>Internal</div>
          </div>
        </div>
      }
      <LinksMap
        containerElement={
          <div style={{ height: `400px` }} />
        }
        mapElement={
          <div style={{ height: `100%` }} />
        }
        center={mapCenter}
        zoom={mapZoom ? mapZoom.zoomLevel : 10}
        onMapLoad={(map) => {
          if (map) {

            if (mapZoom) {
              console.log('fit bounds', map);
              map.fitBounds(mapZoom.bounds);
            }

          }
        }}
        onMapClick={() => {
          console.log('map clicked');
        }}
        content={content}
      />
    </div>
  );

  return (
    <div className={s.container}>
      <div className={s.functionBar}>
        <div className={s.searchFieldContainer}>
          <div className={s.search}>
            <FontIcon className={cx(s.searchIcon, 'material-icons')}>search</FontIcon>
            <div className={s.searchField}>
              <TextField id="link-search-input"
                         value={searchTerm}
                         fullWidth
                         style={{ height: '46px' }}
                         hintText="Origin or destination"
                         onChange={(event) => {
                           const input = event.target.value;
                           setProperty('links.searchTerm', input);
                           if (input.length > 2) {
                             setProperty('links.linkMode', 'external');
                             getLinks({ locality: input });
                           }
                         }} />
            </div>
          </div>
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
      viewMode: state.links.viewMode,
      linkMode: state.links.linkMode || 'external',
      searchTerm: state.links.searchTerm,
      mapZoom: state.links.mapZoom
    }
  }, {
    getLinks,
    setZoomLevel,
    setProperty
  })(withStyles(s)(LinksView))
);
