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
import Link from '../Link';
import { GoogleMap, OverlayView, Polyline, InfoWindow, Marker, withGoogleMap } from 'react-google-maps';
import TextField from 'material-ui/TextField';
import msgTransport from '../common/messages/transport';
import msg from '../EditCheckInItem/messages.terminal';
import { getDateString, getTimeString } from '../utils';

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

const renderLinkInfo = (terminal, intl, wrapperClass) => {

  const renderDateTime = (terminal, label) => {

    if (terminal.date || terminal.time) {
      return (
        <div className={s.dateTime}>
          <div className={s.dateTimeHeader}>
            <b>{label}</b>
          </div>
          <div className={s.dateTimeValue}>
            <div className={s.dateValue}>
              { terminal.date && getDateString(terminal.date) }
            </div>
            <div className={s.timeValue}>
              { terminal.time && getTimeString(terminal.time) }
            </div>
          </div>
        </div>
      );
    }

    return null;

  };

  const departureTerminal = terminal.type === 'departure' ? terminal : terminal.linkedTerminal;
  const arrivalTerminal = terminal.type === 'arrival' ? terminal : terminal.linkedTerminal;

  return (
    <div className={cx(s.linkInfo, wrapperClass)}>
      <div className={s.transportRow}>
        <div className={s.transportType}>
          { intl.formatMessage(msgTransport[departureTerminal.transport]) }
        </div>
        <div className={s.transportId}>
          {departureTerminal.transportId || arrivalTerminal.transportId}
        </div>
      </div>
      <div className={s.fromRow}>
        <b>From:</b>&nbsp;
        <Link to={`/check-in/${departureTerminal.checkInUuid}`}>{departureTerminal.formattedAddress}</Link>
        {
          terminal.type === 'arrival' &&
            <span>&nbsp;[<Link to={`/links?locality=${departureTerminal.locality}`}>{departureTerminal.locality}</Link>]</span>
        }
      </div>
      <div className={s.toRow}>
        <b>To:</b>&nbsp;
        <Link to={`/check-in/${arrivalTerminal.checkInUuid}`}>{arrivalTerminal.formattedAddress}</Link>
        {
          terminal.type === 'departure' &&
          <span>&nbsp;[<Link to={`/links?locality=${arrivalTerminal.locality}`}>{arrivalTerminal.locality}</Link>]</span>
        }
      </div>
      {
        (arrivalTerminal.date || arrivalTerminal.time || departureTerminal.date || departureTerminal.time) &&
        <div className={s.dateTimeRow}>
          {[
            renderDateTime(departureTerminal, 'Departure'),
            renderDateTime(arrivalTerminal, 'Arrival')
          ]}
        </div>
      }
      {
        (departureTerminal.description || arrivalTerminal.description) &&
        <div className={s.linkDescription}>
          <p>{departureTerminal.description}</p>
          <p>{arrivalTerminal.description}</p>
        </div>
      }
      {
        (departureTerminal.priceAmount || arrivalTerminal.priceAmount) &&
        <div className={s.linkCost}>
          <b>Cost:</b>&nbsp;
          {
            arrivalTerminal.priceAmount ?
              <span>{arrivalTerminal.priceAmount} {arrivalTerminal.priceCurrency}</span> :
              <span>{departureTerminal.priceAmount} {departureTerminal.priceCurrency}</span>
          }
        </div>
      }
    </div>
  );

};

const drawLines = (terminals, onHighlight, onSelect, intl) => {

  return (terminals || []).map(terminal => {
    const color = terminal.type === 'departure' ? '#FF0000' : '#909090';
    const polyLine = {
      line: (
        <Polyline
          path={
            [
              { lat: terminal.latitude, lng: terminal.longitude },
              { lat: terminal.linkedTerminal.latitude, lng: terminal.linkedTerminal.longitude }
            ]
          }
          onMouseOver={(event) => {
            terminal.highlighted = true;
            onHighlight(terminal);
          }}
          onMouseOut={(event) => {
            terminal.highlighted = false;
            onHighlight(terminal);
          }}
          onClick={(event) => {
            terminal.selected = true;
            onSelect(terminal);
          }}
          options={{
            geodesic: true,
            strokeColor: color,
            strokeOpacity: terminal.highlighted ? 1.0 : 0.5,
            strokeWeight: 4
          }} />
      )
    };

    if (terminal.selected) {
      polyLine.info = (
        <InfoWindow position={{ lat: terminal.linkedTerminal.latitude, lng: terminal.linkedTerminal.longitude }}
          options={{ maxWidth: '320px' }}
          onCloseClick={() => {
            terminal.selected = false;
            onSelect(terminal);
          }}>
          { renderLinkInfo(terminal, intl, s.mapLinkInfo) }
        </InfoWindow>
      );
    }
    return polyLine;
  });
};

const renderMapLinks = (links, linkMode, onHighlight, onSelect, intl) => {
  return (
      linkMode === 'internal' ?
        drawLines(links.internal, onHighlight, onSelect, intl).map(line => [line.line, line.info]) :
        [
          drawLines(links.departures, onHighlight, onSelect, intl).map(line => [line.line, line.info]),
          drawLines(links.arrivals, onHighlight, onSelect, intl).map(line => [line.line, line.info])
        ]
  );
};

const renderLinkStatsList = (linkStats, onSelect) => {

  const renderTerminalsListing = (terminals, icon, text) => {
    return (
      <div className={s.terminalsListing}>
        <div className={s.terminalTypeIcon}>
          <FontIcon className="material-icons" style={{ fontSize: '24px' }}>
            {icon}
          </FontIcon>
        </div>
        <div>
          {terminals.length} {text} &nbsp;
        </div>
        <div className={s.linkedLocalities}>
          {
            (terminals || []).map((terminal, index) => (
              <span>
                <span>
                  <Link to={`/links?locality=${terminal.linkedTerminal.locality}`}>
                    {terminal.linkedTerminal.locality}
                  </Link>
                </span>
                {
                  index < terminals.length - 1 &&
                  <span>, </span>
                }
              </span>
            ))
          }
        </div>
      </div>
    );
  };

  return (
    <div>
      {

        (linkStats || []).map((linkStat) => {

          const { uuid } = linkStat;
          return (
            <div key={uuid} className={s.linkItem}>
              <div className={s.localityHeader}>
                <span onClick={() => onSelect(linkStat.locality)}>{linkStat.locality}</span>
              </div>
              {
                linkStat.departures.length > 0 &&
                <div>
                  <div>
                    { renderTerminalsListing(linkStat.departures, 'call_made', 'departures to') }
                  </div>
                </div>
              }
              {
                linkStat.arrivals.length > 0 &&
                <div>
                  <div>
                    { renderTerminalsListing(linkStat.arrivals, 'call_received', 'arrivals from') }
                  </div>
                </div>
              }
              {
                linkStat.internal.length > 0 &&
                <div>
                  <div className={s.terminalsListing}>
                    <div className={s.terminalTypeIcon}>
                      <FontIcon className="material-icons" style={{ fontSize: '24px' }}>
                        cached
                      </FontIcon>
                    </div>
                    <div>
                      {linkStat.internal.length} internal connections
                    </div>
                  </div>
                </div>
              }
            </div>
          );
        })
      }
    </div>
  );

};

const renderLinksList = (links, linkMode, intl) => {

  const { uuid } = links;

  const renderLink = (terminal) => {
    return renderLinkInfo(terminal, intl, s.listLinkInfo);
  };

  return (
    <div>
      {
        <div key={uuid} className={s.linkItem}>
          <div className={s.localityHeader}>
            {links.locality}
          </div>
          {
            linkMode === 'internal' ?
              <div>
                { (links.internal || []).map(terminal => renderLink(terminal)) }
              </div> :
              <div>
                <div>
                  { (links.departures || []).map(terminal => renderLink(terminal)) }
                </div>
                <div>
                  { (links.arrivals || []).map(terminal => renderLink(terminal)) }
                </div>
              </div>
          }
        </div>
      }
    </div>
  );

};

const LinksView = ({ intl, links, loadedLinks, query, searchTerm, viewMode, linkMode, mapZoom, selectedLink, getLinks, setProperty }) => {

  let  displayLinks = (loadedLinks || links) || [];

  const onSelectLocality = (locality) => {
    setProperty('links.selectedLink', null);
    setProperty('links.searchTerm', locality);
    setProperty('links.linkMode', 'external');
    getLinks({ locality });
  };

  let mapCenter = {
    lat: 60.16952,
    lng: 24.93545
  };

  if (displayLinks.length > 0) {
    if (!selectedLink) {
      mapCenter = {
        lat: displayLinks[0].latitude,
        lng: displayLinks[0].longitude
      };
    } else {
      mapCenter = {
        lat: selectedLink.linkedTerminal.latitude,
        lng: selectedLink.linkedTerminal.longitude
      }
    }
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

  let mapContent = null;
  let listContent = null;
  if (displayLinks.length === 1) {
    mapContent = renderMapLinks(displayLinks[0], actualLinkMode, (terminal) => {
      if (terminal.highlighted) setProperty('links.highlightedTerminal', terminal.uuid);
      else if (!selectedLink) setProperty('links.highlightedTerminal', null);
    }, (terminal) => {
      if (selectedLink) selectedLink.selected = false;
      if (terminal.selected) setProperty('links.selectedLink', terminal);
      else setProperty('links.selectedLink', null);
    }, intl);
    listContent = renderLinksList(displayLinks[0], actualLinkMode, intl);
  } else {
    mapContent = renderLinkStatsOverlays(displayLinks, onSelectLocality);
    listContent = renderLinkStatsList(displayLinks, onSelectLocality);
  }

  const mapView = (
    <div>
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

            if (mapZoom && !selectedLink) {
              console.log('fit bounds', map);
              map.fitBounds(mapZoom.bounds);
            }

          }
        }}
        onMapClick={() => {
          console.log('map clicked');
        }}
        content={mapContent}
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
                             setProperty('links.selectedLink', null);
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
        showControls &&
        <div className={s.mapControls}>
          <div className={s.selector}>
            <div className={s.selectorElement} style={linkMode === 'external' ? { backgroundColor: '#d0d0d0' } : {}} onClick={() => setProperty('links.linkMode', 'external')}>External</div>
            <div className={s.selectorElement} style={linkMode === 'internal' ? { backgroundColor: '#d0d0d0' } : {}} onClick={() => setProperty('links.linkMode', 'internal')}>Internal</div>
          </div>
        </div>
      }
      {
        (viewMode === 'map') ? mapView : listContent
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
      mapZoom: state.links.mapZoom,
      selectedLink: state.links.selectedLink
    }
  }, {
    getLinks,
    setZoomLevel,
    setProperty
  })(withStyles(s)(LinksView))
);
