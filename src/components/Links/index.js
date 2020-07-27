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
)((props) => {

  const mapProps = {
    ref: props.onMapLoad,
    defaultZoom: props.zoom,
    zoom: props.zoom,
    onClick: props.onMapClick,
    options: {
      streetViewControl: false,
      mapTypeControl: false
    }
  };

  if (props.center) {
    mapProps.center = props.center;
  }

  if (props.defaultCenter) {
    mapProps.defaultCenter = props.defaultCenter;
  }

  return (
    <GoogleMap {...mapProps}>
      {props.content}
    </GoogleMap>
  );

});

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
            <span className="material-icons">call_made</span> {linkStat.departureCount}
          </div>
          <div className={s.localityStats}>
            <span className="material-icons">call_received</span> {linkStat.arrivalCount}
          </div>
          <div className={s.localityStats}>
            <span className="material-icons">cached</span> N/A
          </div>
        </div>
      </OverlayView>
    );
  });
};

const renderLinkInfo = (terminal, intl, wrapperClass) => {

  if (terminal.linkedLocality) {
    return (
      <div>
        SHOW LINK STATS!
      </div>
    );
  }

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

const drawLines = (terminals, onHighlight, onSelect, intl, highlightedTerminal, selectedTerminal) => {

  return (terminals || []).map(terminal => {
    const color = (terminal.type === 'departure' || terminal.linkedTerminalType === 'arrival') ? '#FF0000' : '#909090';
    let lines = [{ lat: terminal.latitude, lng: (terminal.longitude || terminal.linkedLocalityLongitude)}];
    const { route } = terminal;
    if (route && route.length > 0) {
      lines = lines.concat(route);
    }

    lines.push({
      lat: terminal.linkedTerminal ? terminal.linkedTerminal.latitude : terminal.linkedLocalityLatitude,
      lng: terminal.linkedTerminal ? terminal.linkedTerminal.longitude : terminal.linkedLocalityLongitude
    });

    const polyLine = {
      line: (
        <Polyline
          path={lines}
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
            strokeOpacity: (terminal.highlighted || ((terminal.linkedTerminalUuid || '') === highlightedTerminal)) ? 1.0 : 0.5,
            strokeWeight: 4
          }} />
      )
    };

    console.log('draw terminal', terminal);
    if (terminal.selected || ((terminal.linkedTerminalUuid || '') === selectedTerminal)) {
      polyLine.info = (
        <InfoWindow position={{
          lat: terminal.linkedTerminal ? terminal.linkedTerminal.latitude : terminal.linkedLocalityLatitude,
          lng: terminal.linkedTerminal ? terminal.linkedTerminal.longitude : terminal.linkedLocalityLongitude
        }}
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

const renderMapLinks = (links, linkMode, onHighlight, onSelect, intl, highlightedTerminal, selectedTerminal) => {
  console.log('links', links);
  return (
      linkMode === 'internal' ?
        drawLines((links.internal || []), onHighlight, onSelect, intl, highlightedTerminal, selectedTerminal).map(line => [line.line, line.info]) :
        [
          drawLines((links.departures || links.linkedDepartures.map(link => ({ ...link, latitude: links.latitude, longitude: links.longitude  }))), onHighlight, onSelect, intl, highlightedTerminal, selectedTerminal).map(line => [line.line, line.info]),
          drawLines((links.arrivals || links.linkedArrivals.map(link => ({ ...link, latitude: links.latitude, longitude: links.longitude }))), onHighlight, onSelect, intl, highlightedTerminal, selectedTerminal).map(line => [line.line, line.info])
        ]
  );
};

const renderLinkStatsList = (linkStats, onSelect) => {

  return (
    <div>
      {

        (linkStats || []).map((linkStat) => {

          const { uuid } = linkStat;


          const slicedLinkedDepartures = linkStat.linkedDepartures.slice(0, 8);
          const slicedLinkedArrivals = linkStat.linkedArrivals.slice(0, 8);

          return (
            <div key={uuid} className={s.linkItem}>
              {
                <div>
                  <div className={s.labelMap}>
                    {
                      slicedLinkedArrivals.length > 0 &&
                      <div className={s.arrivals}>
                        <div className={s.info}>
                          <div className={s.stats}>
                            <div className={s.statsIcon}>
                              <FontIcon className="material-icons" style={{ fontSize: '31px' }}>
                                call_received
                              </FontIcon>
                            </div>
                            <div className={s.statsNumber}>{linkStat.departureCount}</div>
                          </div>
                          <div className={s.statsLabel}>
                            ARRIVALS
                          </div>
                        </div>
                        <div className={s.connections} style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap'
                        }}>
                          {
                            slicedLinkedArrivals.length > 0 &&
                            slicedLinkedArrivals.map((link, index) => (
                              <div className={s.connection} style={{ ...(index === 0 && { marginLeft: '40px' }) }}>
                                <Link to={`/links?locality=${link.linkedLocality}`}>
                                  {link.linkedLocality}
                                </Link>
                                {
                                  index === 0 &&
                                  <div className={s.directionLabel} style={{ left: '-40px' }}>
                                    FROM
                                  </div>
                                }
                              </div>
                            ))
                          }
                          {
                            slicedLinkedArrivals.length < linkStat.linkedArrivals.length &&
                              <div className={s.otherPlaces}> + {linkStat.linkedArrivals.length - slicedLinkedArrivals.length} other places</div>
                          }
                        </div>
                      </div>
                    }
                    <div className={s.divider}>
                      {
                        slicedLinkedArrivals.length > 0 &&
                          <div className={s.ruler}></div>
                      }
                      <div className={s.mainLocality}
                        onClick={() => onSelect(linkStat.locality)}>
                        {linkStat.locality}
                      </div>
                    </div>
                    {
                      slicedLinkedDepartures.length > 0 &&
                      <div className={s.departures}>
                        <div className={s.connections} style={{
                          flexDirection: 'row-reverse',
                          flexWrap: 'wrap-reverse'
                        }}>
                          {
                            slicedLinkedDepartures.length > 0 &&
                            slicedLinkedDepartures.map((link, index) => (
                              <div className={s.connection} style={{
                                ...(index === slicedLinkedDepartures.length - 1 && { marginLeft: '20px' })
                              }}>
                                <div className={s.locality}>
                                  <Link to={`/links?locality=${link.linkedLocality}`}>
                                    {link.linkedLocality}
                                  </Link>
                                  {
                                    index === slicedLinkedDepartures.length - 1 &&
                                    <div className={s.directionLabel} style={{ left: '-20px' }}>
                                      TO
                                    </div>
                                  }
                                </div>
                              </div>
                            ))
                          }
                          {
                            slicedLinkedDepartures.length < linkStat.linkedDepartures.length &&
                            <div className={s.otherPlaces}> + {linkStat.linkedDepartures.length - slicedLinkedDepartures.length} other places</div>
                          }
                        </div>
                        <div className={s.info}>
                          <div className={s.stats}>
                            <div className={s.statsNumber}>{linkStat.arrivalCount}</div>
                            <div className={s.statsIcon}>
                              <FontIcon className="material-icons" style={{ fontSize: '31px' }}>
                                call_made
                              </FontIcon>
                            </div>
                          </div>
                          <div className={s.statsLabel}>
                            DEPARTURES
                          </div>
                        </div>
                      </div>
                    }
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

const renderLinksList = (linkStat, linkMode, intl) => {

  console.log('LINKSTAT', linkStat);
  const { linkedDepartures, linkedArrivals } = linkStat;

  return (
    <div>
      {
        <div className={s.linkItem}>
          <div className={s.localityHeader}>
            {linkStat.locality}
          </div>
          <div className={s.inboundOutbound}>
            <div className={s.inbound}>
              INBOUND FROM
            </div>
            <div className={s.outbound}>
              OUTBOUND TO
            </div>
          </div>
          {
            linkMode === 'internal' ?
              <div>Internal</div> :
              <div className={s.localityConnections}>
                {
                  (linkedArrivals && linkedArrivals.length > 0) &&
                  <div className={s.inboundColumn}>
                    {
                      linkedArrivals.map(link => {
                        return (
                          <div className={s.inOutLocality}>
                            <Link to={`/links?from=${link.linkedLocality} to=${linkStat.locality}`}>
                              { link.linkedLocality }
                            </Link>
                          </div>
                        );
                      })
                    }
                  </div>

                }
                {
                  (linkedDepartures && linkedDepartures.length > 0) &&
                  <div className={s.outboundColumn}>
                    {
                      linkedDepartures.map(link => {
                        return (
                          <div className={s.inOutLocality}>
                            <Link to={`/links?from=${linkStat.locality} to=${link.linkedLocality}`}>
                              { link.linkedLocality }
                            </Link>
                          </div>
                        );
                      })
                    }
                  </div>
                }
              </div>

          }
        </div>
      }
    </div>
  );

};

const LinksView = ({
  intl, links, loadedLinks, loadedMapCenter, searchTerm, viewMode, linkMode, highlightedTerminal, selectedTerminal,
  mapZoom, selectedLink, transportTypes, showTransportTypes, selectedTransportTypes,
  getLinks, setProperty
}) => {

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

  if (displayLinks && displayLinks.length > 0 && !highlightedTerminal && !selectedTerminal) {
    if (!selectedLink) {
      mapCenter = {
        lat: displayLinks[0].latitude,
        lng: displayLinks[0].longitude
      };
    } else {
      console.log('sel link', selectedLink);
      mapCenter = {
        lat: selectedLink.linkedTerminal ? selectedLink.linkedTerminal.latitude : selectedLink.linkedLocalityLatitude,
        lng: selectedLink.linkedTerminal ? selectedLink.linkedTerminal.longitude : selectedLink.linkedLocalityLongitude
      };
    }
  }

  console.log('disp links', displayLinks);
  const showControls = displayLinks.length === 1 &&
    ((displayLinks[0].departures || displayLinks[0].linkedDepartures).length > 0 || (displayLinks[0].arrivals || displayLinks[0].linkedArrivals).length > 0) && (displayLinks[0].internal || []).length > 0;
  let actualLinkMode = linkMode;
  if (displayLinks.length === 1 && !showControls) {
    if ((displayLinks[0].departures || displayLinks[0].linkedDepartures).length > 0 || (displayLinks[0].arrivals || displayLinks[0].linkedArrivals).length > 0) {
      actualLinkMode = 'external';
    } else if ((displayLinks[0].internal || []).length > 0) {
      actualLinkMode = 'internal';
    }
  }

  let mapContent = null;
  let listContent = null;
  if (displayLinks.length === 1) {
    mapContent = renderMapLinks(displayLinks[0], actualLinkMode, (terminal) => {
      if (terminal.highlighted) {
        setProperty('links.loadedMapCenter', null);
        setProperty('links.highlightedTerminal', terminal.uuid || terminal.linkedTerminalUuid);
      }
      else if (!selectedLink) setProperty('links.highlightedTerminal', null);
    }, (terminal) => {
      if (selectedLink) selectedLink.selected = false;
      if (terminal.selected) {
        setProperty('links.loadedMapCenter', null);
        setProperty('links.selectedLink', terminal);
        setProperty('links.selectedTerminal', terminal.uuid || terminal.linkedTerminalUuid);
      }
      else {
        setProperty('links.selectedLink', null);
        setProperty('links.selectedTerminal', null);
      }
    }, intl, highlightedTerminal, selectedTerminal);
    listContent = renderLinksList(displayLinks[0], actualLinkMode, intl);
  } else {
    mapContent = renderLinkStatsOverlays(displayLinks, onSelectLocality);
    listContent = renderLinkStatsList(displayLinks, onSelectLocality);
  }

  const mapProps = {
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
    defaultCenter: mapCenter,
    zoom: mapZoom ? mapZoom.zoomLevel : 10,
    onMapLoad: (map) => {
      if (map) {
        if (mapZoom && loadedMapCenter && !selectedLink) {
          console.log('fit bounds', map);
          map.fitBounds(mapZoom.bounds);
        }
      }
    },
    onMapClick: () => {
      console.log('map clicked');
    },
    content: mapContent
  };

  if (selectedLink) {
    mapProps.center = mapCenter;
  }

  if (loadedMapCenter) {
    mapProps.center = loadedMapCenter;
  }

  const mapView = (
    <div>
      <LinksMap {...mapProps} />
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
                           if (input.length > 2 || input.length === 0) {
                             setProperty('links.linkMode', 'external');
                             setProperty('links.selectedLink', null);
                             getLinks({ ...(input.length === 0 ? {} : { locality: input }), transportTypes: selectedTransportTypes });
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
      <div className={s.filters}>
        {
          !showTransportTypes ?
            <div className={s.selectedFiltersWrapper}>
            <div className={s.selectedFilters} onClick={() => setProperty('links.showTransportTypes', true)}>
              <div className={s.icon}>
                <FontIcon className="material-icons" style={{ fontSize: '14px', marginTop: '4px' }}>tune</FontIcon>
              </div>
              <div className={s.values}>
                {
                  !selectedTransportTypes || selectedTransportTypes.length === 0 ?
                    'All transport types' :
                    (selectedTransportTypes || []).map((transportType, index) => {
                      let selectedTransportType = transportType === 'all' ?
                        'All transport types' :
                        intl.formatMessage(msgTransport[transportType]);
                      if (index < (selectedTransportTypes || []).length - 1) selectedTransportType += ', ';
                      return selectedTransportType;
                    })
                }
              </div>

            </div>
            </div>:
            <div className={s.transportOptions} onClick={() => setProperty('links.showTransportTypes', false)}>
              {
                [{ slug: 'all' }].concat(transportTypes).map(transportType => (
                  <div className={cx(s.transportOption, selectedTransportTypes.find(type => type === transportType.slug) ? s.selectedTransportOption : {})} onClick={() => {

                    let newSelectedTransportTypes = selectedTransportTypes;
                    if (transportType.slug === 'all') {
                      newSelectedTransportTypes = [];
                    } else {
                      newSelectedTransportTypes =
                        selectedTransportTypes.find(type => type === transportType.slug) ?
                          selectedTransportTypes.filter(type => type !== transportType.slug) :
                          selectedTransportTypes.concat(transportType.slug);
                    }

                    setProperty('links.selectedTransportTypes', newSelectedTransportTypes);
                    getLinks({ locality: searchTerm, transportTypes: newSelectedTransportTypes });

                  }}>
                    {
                      transportType.slug === 'all' ?
                        'All' :
                        intl.formatMessage(msgTransport[transportType.slug])
                    }
                  </div>
                ))
              }
            </div>
        }

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
      loadedMapCenter: state.links.loadedMapCenter,
      fetchedFeedItems: state.posts.fetchedFeedItems || {},
      feedUpdated: state.posts.feedUpdated,
      viewMode: state.links.viewMode,
      linkMode: state.links.linkMode || 'external',
      searchTerm: state.links.searchTerm,
      mapZoom: state.links.mapZoom,
      selectedLink: state.links.selectedLink,
      showTransportTypes: state.links.showTransportTypes,
      selectedTransportTypes: state.links.selectedTransportTypes || [],
      selectedTerminal: state.links.selectedTerminal,
      highlightedTerminal: state.links.highlightedTerminal
    }
  }, {
    getLinks,
    setZoomLevel,
    setProperty
  })(withStyles(s)(LinksView))
);
