import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import cx from 'classnames';
import s from './Links.css';
import { getLinks, searchLocalities, setZoomLevel } from '../../actions/links';
import { navigate } from '../../actions/route';
import { setProperty } from '../../actions/properties';
import { injectIntl } from 'react-intl';
import Link from '../Link';
import FilterHeader, {
  renderLinkedLocalityLabel,
  renderLocalityLabel,
  renderRouteLabel,
  renderTagLabel,
  renderTripLabel
} from '../FilterHeader';
import HorizontalScroller from '../HorizontalScroller';
import LinkDetails from './LinkDetails';
import { GoogleMap, Polyline, withGoogleMap } from 'react-google-maps';
import MarkerClusterer from 'react-google-maps/lib/components/addons/MarkerClusterer';
import MarkerWithLabel from 'react-google-maps/lib/components/addons/MarkerWithLabel';
import TextField from 'material-ui/TextField';
import msgTransport from '../common/messages/transport';
import { getNavigationPath, getNavigationQuery } from '../utils';

const LinksMap = compose(
  withProps({
    googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCqZjEwtftUOFYY0JhkfEiaT28H9I9xKAE&v=3.exp&libraries=geometry,drawing,places',
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div className={s.mapContainer} />,
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

const renderLocationsMap = (linkStats, onSelect) => {

  const iconPin = {
    path: 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z',
    fillOpacity: 0,
    scale: 0.05
  };

  return [
    (
      <MarkerClusterer>
        {(linkStats || []).map(linkStat => (
          <MarkerWithLabel
            icon={iconPin}
            labelAnchor={{ x: 50, y: 30 }}
            key={linkStats.localityUuid}
            position={{ lat: linkStat.latitude, lng: linkStat.longitude }}
            onClick={() => {
              onSelect(linkStat.localityUuid);
            }}>
            <div className={s.localityOverlay}>
              <div className={s.localityName}>
                <a href={`/${linkStat.localityLong}`}>{linkStat.localityLong}</a>
              </div>
              <div className={s.localityStats}>
                <span className="material-icons">call_made</span> {linkStat.departureCount} departures
              </div>
              <div className={s.localityStats}>
                <span className="material-icons">call_received</span> {linkStat.arrivalCount} arrivals
              </div>
            </div>
          </MarkerWithLabel>
        ))}
      </MarkerClusterer>
    )
  ];

};

const renderDetailedLinkInfo = (terminal, selectedTerminal, intl, setProperty, showContent, transportTypes) => {

  const isSelected = (selectedTerminal && selectedTerminal.checkInUuid === terminal.checkInUuid) || showContent;

  return (
    <div className={isSelected ? s.selectedListLink : s.listLink}>
      <div className={s.listLinkHeader} onClick={() => {
        if (isSelected) {
          setProperty('links.selectedTerminal', null);
        } else {
          setProperty('links.selectedTerminal', terminal);
        }
      }}>
        <div className={s.linkHeaderTopRow}>
          <div className={s.linkTypeAndTransport}>
            <div className={s.linkType}>
              <FontIcon className="material-icons" style={{ fontSize: '18px' }}>
                { terminal.type === 'arrival' ? 'call_received' : 'call_made' }
              </FontIcon>
            </div>
            <div className={s.linkTransport}>{ intl.formatMessage(msgTransport[terminal.transport]) }</div>
          </div>
          <div className={s.linkInfo}>
            <div className={s.dateTime}>
              <div className={s.time}>
                { terminal.localDateTime.substring(11, 16) }
              </div>
              <div className={s.date}>
                { terminal.localDateTime.substring(0, 10) }
              </div>
            </div>
          </div>
        </div>
        {
          (terminal.transportId || terminal.linkedTerminal.transportId) &&
          <div className={s.linkHeaderBottomRow}>
            <div className={s.linkId}>
              { terminal.transportId || terminal.linkedTerminal.transportId }
            </div>
          </div>
        }
      </div>
      {
        isSelected &&
          <LinkDetails terminal={terminal} selectedTransportTypes={transportTypes} />
      }
    </div>
  );
};

const getLinesFromTerminal = (terminal) => {

  let lines = [{ lat: terminal.latitude, lng: terminal.longitude }];
  const { route } = terminal;
  if (route && route.length > 0) {
    lines = lines.concat(route);
  }

  lines.push({
    lat: terminal.linkedTerminal.latitude,
    lng: terminal.linkedTerminal.longitude
  });

  return lines;

};

const createPolyLine = (terminal, onSelect, color, opacity) => {

  let lines = getLinesFromTerminal(terminal);

  const polyLine = (
    <Polyline
      path={lines}
      onClick={(event) => {
        terminal.selected = true;
        onSelect(terminal);
      }}
      options={{
        geodesic: true,
        strokeColor: color,
        strokeOpacity: opacity || 1,
        strokeWeight: 4
      }} />
  );

  return polyLine;

};


const renderLocationsList = (linkStats, transportTypes, onSelect) => {

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
                        <div className={s.connections}>
                          {
                            slicedLinkedArrivals.length > 0 &&
                              <div className={s.connectionLocalities} style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap'
                              }}>
                                {
                                  slicedLinkedArrivals.map((link, index) => (
                                    <div className={s.connection} style={{ ...(index === 0 && { marginLeft: '40px' }) }}>
                                      <Link to={
                                        getNavigationQuery({
                                          localityUuid: link.linkedLocalityUuid,
                                          transportTypes
                                        }) + '&view=map'
                                      }>
                                        {link.linkedLocalityLong}
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
                        onClick={() => onSelect(linkStat.localityUuid)}>
                        <div className={s.mainLocalityName}>
                          {linkStat.localityLong}
                        </div>
                      </div>
                    </div>
                    {
                      slicedLinkedDepartures.length > 0 &&
                      <div className={s.departures}>
                        <div className={s.connections}>
                          {
                            slicedLinkedDepartures.length > 0 &&
                              <div className={s.connectionLocalities} style={{
                                flexDirection: 'row-reverse',
                                flexWrap: 'wrap-reverse'
                              }}>
                                {
                                  slicedLinkedDepartures.map((link, index) => (
                                    <div className={s.connection} style={{
                                      ...(index === slicedLinkedDepartures.length - 1 && { marginLeft: '20px' })
                                    }}>
                                      <div className={s.locality}>
                                        <Link to={
                                          getNavigationQuery({
                                            localityUuid: link.linkedLocalityUuid,
                                            transportTypes
                                          }) + '&view=map'
                                        }>
                                          {link.linkedLocalityLong}
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
                          }
                          {
                            linkStat.tags && linkStat.tags.length > 0 &&
                              <div className={s.localityLinks}>
                                {
                                  linkStat.trips.map(trip => {
                                    return (
                                      <div className={s.localityTrip}>
                                        <Link to={`/?trip=${trip.uuid}`}>{ trip.name }</Link>
                                      </div>
                                    );
                                  })
                                }
                                {
                                  linkStat.tags.map(tag => {
                                    return (
                                      <div className={s.localityTag}>
                                        #<Link to={`/?tags=${tag.tag}`}>{ tag.tag }</Link>
                                      </div>
                                    );
                                  })
                                }
                              </div>
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

const renderConnectionsList = (linkStat, linkMode, props) => {

  const { departures, arrivals, internal } = linkStat;
  const { selectedTransportTypes, selectedTerminal, setProperty, intl } = props;

  return (
    <div>
      {
        <div className={s.linkItem}>
          {
            linkMode === 'internal' ?
              <div>
                {
                  (internal || []).map(terminal => {
                    return renderDetailedLinkInfo(terminal, selectedTerminal, intl, setProperty, false, selectedTransportTypes);
                  })
                }
              </div> :
              <div>
                <div className={s.inboundOutbound}>
                  <div className={s.inbound}>
                    <div className={s.directionIcon}>
                      <FontIcon className="material-icons" style={{ fontSize: '20px' }}>
                        call_received
                      </FontIcon>
                    </div>
                    <div className={s.directionText}>
                      FROM
                    </div>
                  </div>
                  <div className={s.outbound}>
                    <div className={s.directionIcon}>
                      <FontIcon className="material-icons" style={{ fontSize: '20px' }}>
                        call_made
                      </FontIcon>
                    </div>
                    <div className={s.directionText}>
                      TO
                    </div>
                  </div>
                </div>
                <div className={s.localityConnections}>
                  {
                    (arrivals && arrivals.length > 0) &&
                    <div className={s.inboundColumn}>
                      {
                        arrivals.map(terminal => {
                          return (
                            <div className={s.inOutLocality}>

                              <Link to={
                                getNavigationQuery({
                                  localityUuid: terminal.linkedTerminal.localityUuid,
                                  transportTypes: selectedTransportTypes
                                }) + '&view=map'
                              }>
                                { terminal.linkedTerminal.localityLong }
                              </Link>&nbsp;
                              (<Link to={
                                getNavigationQuery({
                                  localityUuid: terminal.localityUuid,
                                  linkedLocalityUuid: terminal.linkedTerminal.localityUuid,
                                  transportTypes: selectedTransportTypes
                                }) + '&view=map'
                              }>
                              &nbsp;{ terminal.linkCount }&nbsp;
                              </Link>)
                            </div>
                          );
                        })
                      }
                    </div>

                  }
                  {
                    (departures && departures.length > 0) &&
                    <div className={s.outboundColumn}>
                      {
                        departures.map(terminal => {
                          return (
                            <div className={s.inOutLocality}>

                              <Link to={
                                getNavigationQuery({
                                  localityUuid: terminal.linkedTerminal.localityUuid,
                                  transportTypes: selectedTransportTypes
                                }) + '&view=map'
                              }>
                                { terminal.linkedTerminal.localityLong }
                              </Link>&nbsp;
                              (<Link to={
                              getNavigationQuery({
                                localityUuid: terminal.localityUuid,
                                linkedLocalityUuid: terminal.linkedTerminal.localityUuid,
                                transportTypes: selectedTransportTypes
                              }) + '&view=map'
                            }>
                              &nbsp;{ terminal.linkCount }&nbsp;
                            </Link>)
                            </div>
                          );
                        })
                      }
                    </div>
                  }
                </div>
              </div>
          }
        </div>
      }
    </div>
  );

};

const renderLinksList = (props) => {

  const { setProperty, linksResult, selectedTerminal, selectedRoute, intl, selectedTransportTypes } = props;

  const terminals = linksResult.links && linksResult.links.length > 0 ?
    (linksResult.links[0].arrivals || []).concat(linksResult.links[0].departures || [])
    : [];

  let routeIds = terminals.map(terminal => terminal.routeId)
    .filter((routeId, index, self) => self.indexOf(routeId) === index)
    .sort((id1, id2) => id1 - id2);

  const routes = routeIds.map(routeId => ({
    routeId,
    terminals: []
  }));

  for (let i = 0; i < terminals.length; i++) {
    if (terminals[i].routeId) routes[terminals[i].routeId - 1].terminals.push(terminals[i]);
  }

  return (
    <div>
      {
        routes.length > 1 ?
          <div className={s.routesList}>
            {
              routes.map(route => (
                <div className={route.routeId === selectedRoute ? s.selectedRoute : s.route}>
                  <div className={s.routeHeader} onClick={() => {
                    setProperty('links.selectedRoute', route.routeId);
                    setProperty('links.selectedTerminal', null);
                  }}>Route {route.routeId}</div>
                  <div className={s.linksList}>
                    {
                      route.terminals.sort((t1, t2) => t1.routeIndex - t2.routeIndex)
                        .filter(terminal => (!selectedRoute && route.routeId === 1) || terminal.routeId === selectedRoute)
                        .map(terminal => renderDetailedLinkInfo(terminal, selectedTerminal, intl, setProperty, false, selectedTransportTypes))
                    }
                  </div>
                </div>
              ))
            }
          </div> :
          <div className={s.linksList}>
            {
              terminals
                .map(terminal => renderDetailedLinkInfo(terminal, selectedTerminal, intl, setProperty, false, selectedTransportTypes))
            }
          </div>
      }

    </div>
  );

};

const getRoutesMapContent = (terminals, selectedRoute, selectedTerminal, onSelect) => {

  return terminals.sort(t => t.routeId === selectedRoute ? 1 : -1).map(terminal => {

    let color = '#909090';
    if (selectedRoute && terminal.routeId === selectedRoute) color = '#FF0000';

    let opacity = 0.25;
    if (selectedTerminal && selectedTerminal.uuid === terminal.uuid) opacity = 1;

    return [ createPolyLine(terminal, onSelect, color, opacity) ];

  });

};


const getTripMapContent = (terminals, selectedTerminal, onSelect) => {
  return terminals.map(terminal => {
    let opacity = 0.25;
    if (selectedTerminal && selectedTerminal.uuid === terminal.uuid) opacity = 1;
    return [ createPolyLine(terminal, onSelect, '#FF0000', opacity) ];
  });
};

const getConnectionsMapContent = (terminals, onSelect) => {
  return terminals.map(terminal => {
    return [ createPolyLine(terminal, onSelect, terminal.type === 'departure' ? '#FF0000' : '#A0A0A0', 1) ];
  });
};

const getLinksMapContent = (terminals, selectedTerminal, onSelect) => {
  return terminals.map(terminal => {
    const color = terminal.type === 'departure' ? '#FF0000' : '#A0A0A0';
    let opacity = 0.25;
    if (selectedTerminal && selectedTerminal.uuid === terminal.uuid) opacity = 1;
    return [ createPolyLine(terminal, onSelect, color, opacity) ];
  });
};

const LinksView = (props) => {

  const {
    intl, linksResult, localitySearchResults, searchTerm, routeSearchTerm, viewMode, linkMode,
    mapZoom, transportTypes, showTransportTypes, mapBoundsUpdated, query,
    selectedTransportTypes, selectedLocalityUuid, selectedLinkedLocalityUuid, selectedTerminal, selectedTag, selectedRoute, localityOverlays,
    setProperty, searchLocalities, navigate
  } = props;

  let displayLinksResult = linksResult || [];
  let displayLinks = displayLinksResult.links;
  let searchResultType = displayLinksResult.searchResultType;

  const onSelectLocality = (localityUuid) => {

    setProperty('links.searchTerm', '');
    setProperty('links.selectedLocalityUuid', localityUuid);
    setProperty('links.linkMode', 'external');

    navigate(getNavigationPath({ localityUuid, transportTypes: selectedTransportTypes, view: 'map' }));

  };

  const mapCenter = {
    lat: 60.16952,
    lng: 24.93545
  };

  const showControls = displayLinks.length === 1 &&
    (displayLinks[0].departures.length > 0 || displayLinks[0].arrivals || displayLinks[0].length > 0) && (displayLinks[0].internal || []).length > 0;
  let actualLinkMode = linkMode;
  if (displayLinks.length === 1 && !showControls) {
    if (displayLinks[0].departures.length > 0 || displayLinks[0].arrivals.length > 0) {
      actualLinkMode = 'external';
    } else if ((displayLinks[0].internal || []).length > 0) {
      actualLinkMode = 'internal';
    }
  }

  let mapContent = null;
  let listContent = null;
  let searchHeader = null;

  let filterOptions = {
    icon: 'public',
    clearUrl: '/links',
  };

  const urlParams = {
    path: '/',
    transportTypes: selectedTransportTypes
  };

  if (displayLinksResult.user) {
    filterOptions.user = {
      uuid: query.user,
      userImage: displayLinksResult.userImage,
      userName: displayLinksResult.user
    };
    urlParams.user = query.user;
  }

  if (searchResultType === 'connections') {

    if (displayLinks.length < 2) {

      filterOptions = {
        ...filterOptions,
        locality: displayLinksResult.localityLong,
        label: renderLocalityLabel(displayLinksResult.localityLong),
        getUrl: () => getNavigationQuery({
          ...urlParams,
          localityUuid: displayLinksResult.localityUuid
        })
      };

      if (displayLinks.length === 0) {

        const noResults = (
          <div className={s.noResults}>
            No places found matching search criteria :(
            <br /><br />
            Please contribute by creating new and exciting transit data! :)
          </div>
        );
        mapContent = null;
        listContent = noResults;

      } else {

        searchHeader = (
          <div>
            <FilterHeader {...filterOptions} />
            <div className={s.routeSearch}>
              <FontIcon className={cx(s.routeSearchIcon, 'material-icons')}>directions</FontIcon>
              <div className={s.routeSearchField}>
                <TextField id="link-search-input"
                           value={routeSearchTerm}
                           fullWidth
                           style={{ height: '46px' }}
                           hintText={`Search route to...`}
                           onChange={(event) => {
                             const input = event.target.value;
                             setProperty('links.routeSearchTerm', input);
                             if (input.length > 2) {
                               searchLocalities(input);
                             } else {
                               setProperty('links.searchLocalities', null);
                             }
                           }}
                />
              </div>
            </div>
          </div>
        );

        const links = displayLinks[0];
        links.departures.forEach(terminal => {
          const joinedTerminal =
            terminal.type === 'departure' ?
              (links.arrivals || []).find(t => (
                t.locality === terminal.locality &&
                t.linkedTerminal.locality === terminal.linkedTerminal.locality
              )) :
              (links.departures || []).find(t => t.locality === terminal.locality);

          terminal.departureCount = links.departureCount;
          terminal.arrivalCount = links.arrivalCount;

          if (joinedTerminal) {
            terminal.joinedTerminal = joinedTerminal;
            terminal.isJoined = true;
            joinedTerminal.ignore = true;
          }
        });

        //mapContent = renderConnectionsMap(displayLinks[0], selectedTransportTypes, actualLinkMode, selectedTerminal, onHighlightConnection, onSelectConnection, intl);
        mapContent = getConnectionsMapContent(links.departures.filter(dep => !dep.ignore).concat(links.arrivals), terminal => {
          navigate(getNavigationPath({
            localityUuid: terminal.localityUuid,
            linkedLocalityUuid: terminal.linkedTerminal.localityUuid,
            transportTypes: selectedTransportTypes,
            view: 'map'
          }));
        });
        listContent = renderConnectionsList(displayLinks[0], actualLinkMode, props);

      }

    } else {
      mapContent = renderLocationsMap(displayLinks, onSelectLocality);
      listContent = renderLocationsList(displayLinks, selectedTransportTypes, onSelectLocality);
    }

  } else if (searchResultType === 'links') {

    const links = displayLinks[0];

    filterOptions = {
      ...filterOptions,
      locality: displayLinksResult.localityLong,
      label: renderLinkedLocalityLabel(
        displayLinksResult.localityLong,
        displayLinksResult.linkedLocalityLong,
        getNavigationQuery({
          localityUuid: displayLinksResult.linkedLocalityUuid,
          linkedLocalityUuid: displayLinksResult.localityUuid,
          transportTypes: selectedTransportTypes,
          view: 'map'
        })
      ),
      getUrl: () => getNavigationQuery({
        ...urlParams,
        localityUuid: displayLinksResult.localityUuid,
        linkedLocalityUuid: displayLinksResult.linkedLocalityUuid
      }),
      clearUrl: getNavigationQuery({
        localityUuid: displayLinksResult.localityUuid,
        transportTypes: selectedTransportTypes,
        view: 'map'
      })
    };

    searchHeader = <FilterHeader {...filterOptions} />;

    mapContent = getLinksMapContent(links.departures.concat(links.arrivals), selectedTerminal, (terminal) => {
      setProperty('links.selectedTerminal', terminal);
    });
    listContent = renderLinksList(props);

  } else if (searchResultType === 'route') {

    const displayRoute = (selectedRoute || (query.route && parseInt(query.route))) || 1;

    filterOptions = {
      ...filterOptions,
      from: displayLinksResult.from,
      to: displayLinksResult.to,
      label: renderRouteLabel(displayLinksResult.fromName, displayLinksResult.toName),
      getUrl: () => getNavigationQuery({
        ...urlParams,
        locality: displayLinksResult.from,
        from: displayLinksResult.from,
        to: displayLinksResult.to,
        route: displayRoute,
        transportTypes: selectedTransportTypes
      }),
      clearUrl: getNavigationQuery({
        transportTypes: selectedTransportTypes,
        localityUuid: displayLinksResult.from,
        view: 'map'
      })
    };

    searchHeader = <FilterHeader {...filterOptions} />;

    if (displayLinks.length > 0) {
      mapContent = getRoutesMapContent(displayLinks[0].departures, displayRoute, selectedTerminal, (terminal) => {
        setProperty('links.selectedRoute', terminal.routeId);
        setProperty('links.selectedTerminal', terminal);
      });
      listContent = renderLinksList(props);
    } else {
      const noResults = (
        <div className={s.noResults}>
          We can't find any routes from {displayLinksResult.fromName} to {displayLinksResult.toName} yet.
          <br /><br />
          Please help us develop Transitlinks and contribute route information!
        </div>
      );
      mapContent = null;
      listContent = noResults;
    }


  } else if (searchResultType === 'tagged') {

    filterOptions = {
      ...filterOptions,
      tag: selectedTag,
      label: renderTagLabel(selectedTag, filterOptions.user),
      getUrl: () => getNavigationQuery({
        ...urlParams,
        tags: selectedTag
      })
    };

    searchHeader = <FilterHeader {...filterOptions} />;

    mapContent = getTripMapContent(displayLinks[0].departures, selectedTerminal, (terminal) => {
      setProperty('links.selectedTerminal', terminal);
    });
    listContent = renderLinksList(props);

  } else if (searchResultType === 'trip') {

    filterOptions = {
      ...filterOptions,
      trip: query.trip,
      label: renderTripLabel(displayLinksResult.tripName, filterOptions.user),
      getUrl: () => getNavigationQuery({
        ...urlParams,
        trip: query.trip
      })
    };

    searchHeader = <FilterHeader {...filterOptions} />;

    if (displayLinks.length > 0) {
      mapContent = getTripMapContent(displayLinks[0].departures, selectedTerminal, (terminal) => {
        setProperty('links.selectedTerminal', terminal);
      });
      listContent = renderLinksList(props);
    } else {
      const noResults = (
        <div className={s.noResults}>
          Unfortunately this trip does not have any transit information.
        </div>
      );
      mapContent = null;
      listContent = noResults;
    }

  }


  const mapProps = {
    containerElement: <div className={s.mapContainer} />,
    mapElement: <div style={{ height: `100%` }} />,
    defaultCenter: mapCenter,
    defaultZoom: mapZoom ? mapZoom.zoomLevel : 10,
    onMapLoad: (map) => {
      if (map) {
        if ((mapZoom && mapZoom.updated !== mapBoundsUpdated) || query.view !== viewMode) {
          if (mapZoom) {
            map.fitBounds(mapZoom.bounds);
          } else {
            setProperty('links.viewMode', query.view);
          }
        }
      }
    },
    onMapClick: () => {
      console.log('map clicked');
    },
    content: mapContent
  };

  const mapView = (
    <div>
      <LinksMap {...mapProps} />
    </div>
  );

  return (
    <div className={s.container}>
      {
        (!searchResultType || (searchResultType === 'connections' && (displayLinks.length > 1 || displayLinks.length === 0))) &&
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
                               setProperty('links.selectedLocalityUuid', null);
                               setProperty('links.selectedLinkedLocalityUuid', null);
                               navigate(getNavigationPath({
                                 search: input,
                                 transportTypes: selectedTransportTypes,
                                 view: 'map'
                               }));
                             }
                           }} />
              </div>
            </div>
          </div>
          <div className={s.mapToggle}>
            {
              ((viewMode || query.view) === 'map') ?
                <FontIcon className="material-icons" style={{ fontSize: '24px' }}
                          onClick={() => setProperty('links.viewMode', 'list')}>list</FontIcon> :
                <FontIcon className="material-icons" style={{ fontSize: '24px' }}
                          onClick={() => setProperty('links.viewMode', 'map')}>map</FontIcon>
            }
          </div>
        </div>
      }
      <div>
        { searchHeader }
      </div>
      {
        !localitySearchResults && (
          (searchResultType === 'connections' && displayLinks.length === 1) ||
          (searchResultType === 'links')
        ) &&
        <div className={s.filters}>
          <HorizontalScroller content={
            <div className={s.relevantTags}>
              {
                ((displayLinks || []).flatMap(link => link.trips || [])).map(trip => {
                  return (
                    <div className={s.relevantTrip}>
                      <Link to={`/?trip=${trip.uuid}`}>{trip.name}</Link>
                    </div>
                  );
                })
              }
              {
                ((displayLinks || []).flatMap(link => link.tags || [])).map(tag => {
                  return (
                    <div className={s.relevantTag}>
                      #<Link to={`/?tags=${tag.tag}`}>{tag.tag}</Link>
                    </div>
                  );
                })
              }
            </div>
          } />
        </div>
      }
      {
        localitySearchResults &&
        <div className={s.localitySearchResults}>
        {
          localitySearchResults.length > 0 ?
            localitySearchResults.map(loc => (
              <div className={s.localitySearchResult}>
                <Link to={
                  getNavigationQuery({
                    from: displayLinksResult.localityUuid,
                    to: loc.uuid,
                    transportTypes: selectedTransportTypes
                  }) + '&view=map'
                }>
                  {loc.nameLong}
                </Link>
              </div>
            )) :
            <div className={s.localitySearchResult}>No places found</div>
        }
        </div>
      }
      {
        (searchResultType !== 'tagged' && searchResultType !== 'trip') &&
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
              </div> :
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

                      const pathParams = {
                        localityUuid: selectedLocalityUuid,
                        linkedLocalityUuid: selectedLinkedLocalityUuid,
                        search: searchTerm,
                        transportTypes: newSelectedTransportTypes,
                        view: 'map'
                      };

                      if (query.from && query.to) {
                        pathParams.from = query.from;
                        pathParams.to = query.to;
                      }

                      navigate(getNavigationPath(pathParams));

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
      }
      {
        showControls &&
        <div className={s.mapControls}>
        </div>
      }
      {
        (
          (searchResultType === 'links' && displayLinks.length > 0) ||
          searchResultType === 'tagged' ||
          (searchResultType === 'trip' && displayLinks.length > 0) ||
          (searchResultType === 'route' && displayLinks.length > 0) ||
          (searchResultType === 'connections' && displayLinks.length === 1)
        ) ?
          <div className={s.linksView}>
            {
              <div className={s.map}>
                { mapView }
              </div>
            }
            <div className={s.list}>
              { listContent }
            </div>
          </div> :
          (((viewMode || query.view) === 'map' && mapContent) ? mapView : listContent)
      }
    </div>
  );

};

LinksView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => {
    return {
      loadedLinksResult: state.links.transitLinks,
      loadedMapCenter: state.links.loadedMapCenter,
      fetchedFeedItems: state.posts.fetchedFeedItems || {},
      feedUpdated: state.posts.feedUpdated,
      mapBoundsUpdated: state.links.mapBoundsUpdated,
      viewMode: state.links.viewMode,
      linkMode: state.links.linkMode || 'external',
      searchTerm: state.links.searchTerm,
      routeSearchTerm: state.links.routeSearchTerm,
      selectedLocalityUuid: state.links.selectedLocalityUuid,
      selectedLinkedLocalityUuid: state.links.selectedLinkedLocalityUuid,
      selectedTag: state.links.selectedTag,
      selectedTerminal: state.links.selectedTerminal,
      selectedRoute: state.links.selectedRoute,
      mapZoom: state.links.mapZoom,
      showTransportTypes: state.links.showTransportTypes,
      selectedTransportTypes: state.links.selectedTransportTypes || [],
      localitySearchResults: state.links.searchLocalities,
      localityOverlays: state.links.localityOverlays || []
    }
  }, {
    getLinks,
    searchLocalities,
    setZoomLevel,
    setProperty,
    navigate
  })(withStyles(s)(LinksView))
);
