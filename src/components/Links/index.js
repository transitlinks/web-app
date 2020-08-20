import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import cx from 'classnames';
import s from './Links.css';
import { getLinks, setZoomLevel } from '../../actions/links';
import { navigate } from '../../actions/route';
import { setProperty } from '../../actions/properties';
import { injectIntl, FormattedMessage } from 'react-intl';
import Link from '../Link';
import { GoogleMap, OverlayView, Polyline, InfoWindow, Marker, withGoogleMap } from 'react-google-maps';
import TextField from 'material-ui/TextField';
import msgTransport from '../common/messages/transport';
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

const getNavigationPath = (params) => {

  const path = {
    pathname: '/links'
  };

  const { search, locality, linkedLocality, transportTypes } = params;
  const paramsList = [];
  if (locality) {
    paramsList.push(`locality=${locality}`);
  }
  if (linkedLocality) {
    paramsList.push(`linkedLocality=${linkedLocality}`);
  }
  if (search) {
    paramsList.push(`search=${search}`);
  }
  if (transportTypes && transportTypes.length > 0) {
    paramsList.push(`transportTypes=${transportTypes.join(',')}`);
  }
  if (paramsList.length > 0) {
    path.search = `?${paramsList.join('&')}`;
  }

  return path;

};

const getNavigationQuery = (params) => {
  const path = getNavigationPath(params);
  return path.pathname + (path.search || '');
};

const renderLocationsMap = (linkStats, onSelect) => {
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

const renderDetailedLinkInfo = (terminal, selectedTerminal, intl, setProperty, showContent) => {

  const getDateTimeStr = (terminal) => {

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    let date = '';
    if (terminal.localDateTime) {
      const terminalDate = terminal.localDateTime;
      date = months[parseInt(terminalDate.substring(5, 7)) - 1] + ' ' + parseInt(terminalDate.substring(8, 10));
    }

    const time = terminal.localDateTime ?
      terminal.localDateTime.substring(11, 16) : '';
    return <span><span>{ date }</span> <span style={{ fontWeight: 'bold' }}>{ time }</span></span>;
  };

  const getTripDuration = (terminal) => {

    if (terminal.localDateTime && terminal.linkedTerminal.localDateTime) {

      const time = new Date(terminal.localDateTime).getTime();
      const linkedTime = new Date(terminal.linkedTerminal.localDateTime).getTime();

      const timeDiff = Math.abs(time - linkedTime);
      const minuteUnit = 60 * 1000;
      const hourUnit = 60 * minuteUnit;
      const dayUnit = 24 * hourUnit;

      const remainingAfterDays = timeDiff % dayUnit;
      const dayTime = timeDiff - remainingAfterDays;
      const days = dayTime / dayUnit;

      const remainingAfterHours = remainingAfterDays % hourUnit;
      const hourTime = remainingAfterDays - remainingAfterHours;
      const hours = hourTime / hourUnit;

      const minutes = Math.round(remainingAfterHours / minuteUnit);

      let durationStr = '';
      if (days > 0) durationStr += days + ' d';
      if (hours > 0) durationStr += ' ' + hours + ' h';
      if (minutes > 0 || durationStr.length === 0) durationStr += ' ' + minutes + ' min';

      return durationStr;

    } else {
      return null;
    }
  };

  const fromTerminal = terminal.type === 'departure' ? terminal : terminal.linkedTerminal;
  const toTerminal = terminal.type === 'arrival' ? terminal : terminal.linkedTerminal;
  const isSelected = (selectedTerminal && selectedTerminal.checkInUuid === terminal.checkInUuid) || showContent;
  return (
    <div className={s.listLink}>
      <div className={s.listLinkHeader} style={isSelected ? { backgroundColor: '#f0f0f0' } : {}} onClick={() => {
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
        <div className={s.listLinkContent}>
          <div className={s.terminalFromTo}>
            <div className={s.terminalTimes}>
              <div className={s.departureTime}>
                { getDateTimeStr(fromTerminal) }
              </div>
              <div className={s.duration}>
                { getTripDuration(terminal) }
              </div>
              <div className={s.arrivalTime}>
                { getDateTimeStr(toTerminal) }
              </div>
            </div>
            <div className={s.terminalAddresses}>
              <div className={s.terminalFrom}>
                <div className={s.terminalAddressContainer}>
                  <p className={s.terminalAddress}>
                                <span className={s.terminalAddressHeader}>
                                  FROM
                                </span>
                    <Link to={`/check-in/${fromTerminal.checkInUuid}`}>
                      { fromTerminal.formattedAddress }
                    </Link>
                  </p>
                </div>
              </div>
              <div className={s.terminalTo}>
                <div className={s.terminalAddressContainer}>
                  <p className={s.terminalAddress}>
                                <span className={s.terminalAddressHeader}>
                                  TO
                                </span>
                    <Link to={`/check-in/${toTerminal.checkInUuid}`}>
                      { toTerminal.formattedAddress }
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={s.terminalPriceDescription}>
            <p>
              {
                (terminal.priceAmount || terminal.linkedTerminal.priceAmount) &&
                <span>
                                <span className={s.label}>Price:</span>
                                <span className={s.content}>{ terminal.priceAmount || terminal.linkedTerminal.priceAmount } { terminal.priceCurrency } </span> :
                              </span>
              }
              {
                (terminal.description || terminal.linkedTerminal.description) &&
                <span>
                                <span className={s.label}>Description:</span>
                                <span className={s.content}>{ terminal.description || terminal.linkedTerminal.description }</span>
                              </span>
              }
            </p>
          </div>
          {
            (terminal.tags && terminal.tags.length > 0) &&
            <div className={s.terminalTags}>
              {
                (terminal.tags || []).map(tag => {
                  return (
                    <div className={s.terminalTag}>
                      #<Link
                      to={`/links?tag=${tag.tag}&user=${tag.userUuid}&view=map`}>{tag.tag}</Link>
                    </div>
                  );
                })
              }
            </div>
          }
        </div>
      }
    </div>
  );
};

const renderLinkInfo = (terminal, transportTypes, selectedTerminal, intl, setProperty) => {

  if (!terminal.formattedAddress) {

    const { locality, linkedTerminal, joinedTerminal } = terminal;

    const renderArrivalStats = (departureLocality, arrivalLocality, linkCount) => {
      return (
        <div className={s.from}>
          <div className={s.terminalIcon}>
            <FontIcon className="material-icons" style={{ fontSize: '32px' }}>
              call_received
            </FontIcon>
          </div>
          <div className={s.terminalStats}>
            <div className={s.routeStats}>
              <Link to={
                getNavigationQuery({
                  locality: departureLocality,
                  linkedLocality: arrivalLocality,
                  transportTypes
                })
              }>
                { linkCount } arrivals
              </Link>
            </div>
            <div className={s.localityStats}>
              <div className={s.directionLabel}>From</div>
              <div className={s.directionLocality}>
                <Link to={
                  getNavigationQuery({
                    locality: arrivalLocality,
                    transportTypes
                  })
                }>{ arrivalLocality }</Link>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const renderDepartureStats = (departureLocality, arrivalLocality, linkCount) => {
      return (
        <div className={s.to}>
          <div className={s.terminalStats}>
            <div className={s.localityStats}>
              <div className={s.directionLabel}>To</div>
              <div className={s.directionLocality}>
                <Link to={
                  getNavigationQuery({
                    locality: departureLocality,
                    transportTypes
                  })
                }>{ departureLocality }</Link>
              </div>
            </div>
            <div className={s.routeStats}>
              <Link to={
                getNavigationQuery({
                  locality: departureLocality,
                  linkedLocality: arrivalLocality,
                  transportTypes
                })
              }>
                { linkCount } departures
              </Link>
            </div>
          </div>
          <div className={s.terminalIcon}>
            <FontIcon className="material-icons" style={{ fontSize: '32px' }}>
              call_made
            </FontIcon>
          </div>
        </div>
      );
    };

    return (
      <div className={s.linkPopup}>
        <div className={s.route}>
          <div className={s.routePath}>
            {
              (terminal.type === 'arrival' && terminal.linkCount > 0) &&
                renderArrivalStats(terminal.locality, terminal.linkedTerminal.locality, terminal.linkCount)
            }
            {
              (terminal.type === 'departure' && terminal.reverseLinkCount > 0) &&
                renderArrivalStats(terminal.locality, terminal.linkedTerminal.locality, terminal.reverseLinkCount)
            }
            <div className={s.locality}>
              { locality }
            </div>
            {
              (terminal.type === 'departure' && terminal.linkCount > 0) &&
                renderDepartureStats(terminal.linkedTerminal.locality, terminal.locality, terminal.linkCount)
            }
            {
              (terminal.type === 'arrival' && terminal.reverseLinkCount > 0) &&
                renderDepartureStats(terminal.linkedTerminal.locality, terminal.locality, terminal.reverseLinkCount)
            }
          </div>
        </div>
      </div>
    );
  }

  const renderDateTime = (terminal, label) => {

    if (terminal.localDateTime) {
      return (
        <div className={s.dateTime}>
          <div className={s.dateTimeHeader}>
            <b>{label}</b>
          </div>
          <div className={s.dateTimeValue}>
            <div className={s.dateValue}>
              { getDateString(terminal.localDateTime) }
            </div>
            <div className={s.timeValue}>
              { getTimeString(terminal.localDateTime) }
            </div>
          </div>
        </div>
      );
    }

    return null;

  };

  return (
    <div className={s.linkPopup}>
      { renderDetailedLinkInfo(terminal, selectedTerminal, intl, setProperty, true) }
    </div>
  );

};

const drawLines = (links, transportTypes, type, selectedTerminal, onHighlight, onSelect, intl, setProperty) => {
  return (links[type] || []).filter(terminal => !terminal.ignore).map(terminal => {
    const color = terminal.type === 'departure' ? '#FF0000' : '#909090';
    let lines = [{ lat: terminal.latitude, lng: terminal.longitude }];
    const { route } = terminal;
    if (route && route.length > 0) {
      lines = lines.concat(route);
    }

    lines.push({
      lat: terminal.linkedTerminal.latitude,
      lng: terminal.linkedTerminal.longitude
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
            strokeOpacity: terminal.highlighted ? 1.0 : 0.5,
            strokeWeight: 4
          }} />
      )
    };

    if (terminal.selected) {
      polyLine.info = (
        <InfoWindow position={{
          lat: terminal.latitude,
          lng: terminal.longitude
        }}
          options={{ maxWidth: '320px' }}
          onCloseClick={() => {
            terminal.selected = false;
            onSelect(terminal);
          }}>
          { renderLinkInfo(terminal, transportTypes, selectedTerminal, intl, setProperty) }
        </InfoWindow>
      );
    }
    return polyLine;
  });
};

const renderConnectionsMap = (linkStat, transportTypes, linkMode, selectedTerminal, onHighlight, onSelect, intl, setProperty) => {

  const processTerminals = (terminals) => {

    terminals.forEach(terminal => {

      const joinedTerminal =
        terminal.type === 'departure' ?
          (linkStat.arrivals || []).find(t => (
            t.locality === terminal.locality &&
            t.linkedTerminal.locality === terminal.linkedTerminal.locality
          )) :
          (linkStat.departures || []).find(t => t.locality === terminal.locality);

      terminal.departureCount = linkStat.departureCount;
      terminal.arrivalCount = linkStat.arrivalCount;

      if (joinedTerminal) {
        terminal.joinedTerminal = joinedTerminal;
        terminal.isJoined = true;
        joinedTerminal.ignore = true;
      }

    });

  };

  processTerminals(linkStat.departures);

  return (
      linkMode === 'internal' ?
        drawLines(linkStat, transportTypes, 'internal', selectedTerminal, onHighlight, onSelect, intl, setProperty).map(line => [line.line, line.info]) :
        [
          drawLines(linkStat, transportTypes,'departures', selectedTerminal, onHighlight, onSelect, intl, setProperty).map(line => [line.line, line.info]),
          drawLines(linkStat, transportTypes, 'arrivals', selectedTerminal, onHighlight, onSelect, intl, setProperty).map(line => [line.line, line.info])
        ]
  );
};

const renderLinksMap = (props, onHighlight, onSelect) => {

  const { linksResult, selectedTransportTypes, linkMode, selectedTerminal, setProperty, intl } = props;

  let linkStat = linksResult.links && linksResult.links.length > 0 ? linksResult.links[0] : null;
  if (!linkStat) {
    return null;
  }


  if (selectedTerminal) {
    linkStat = selectedTerminal.type === 'departure' ?
      { departures: [selectedTerminal] } :
      { arrivals: [selectedTerminal] };
  }

  return (
    linkMode === 'internal' ?
      drawLines(linkStat, selectedTransportTypes, 'internal', selectedTerminal, onHighlight, onSelect, intl, setProperty).map(line => [line.line, line.info]) :
      [
        drawLines(linkStat, selectedTransportTypes,'departures', selectedTerminal, onHighlight, onSelect, intl, setProperty).map(line => [line.line, line.info]),
        drawLines(linkStat, selectedTransportTypes,'arrivals', selectedTerminal, onHighlight, onSelect, intl, setProperty).map(line => [line.line, line.info])
      ]
  );
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
                                          locality: link.linkedLocality,
                                          transportTypes
                                        })
                                      }>
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
                        <div className={s.mainLocalityName}>
                          {linkStat.locality}
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
                                            locality: link.linkedLocality,
                                            transportTypes
                                          })
                                        }>
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
                          }
                          {
                            linkStat.tags && linkStat.tags.length > 0 &&
                            <div className={s.localityTags}>
                              {
                                linkStat.tags.map(tag => {
                                  return (
                                    <div className={s.localityTag}>
                                      #<Link to={`/links?tag=${tag.tag}&user=${tag.userUuid}&view=map`}>{ tag.tag }</Link>
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
                    return renderDetailedLinkInfo(terminal, selectedTerminal, intl, setProperty);
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
                                  locality: terminal.linkedTerminal.locality,
                                  transportTypes: selectedTransportTypes
                                })
                              }>
                                { terminal.linkedTerminal.locality }
                              </Link>&nbsp;
                              (<Link to={
                                getNavigationQuery({
                                  locality: terminal.locality,
                                  linkedLocality: terminal.linkedTerminal.locality,
                                  transportTypes: selectedTransportTypes
                                })
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
                                  locality: terminal.linkedTerminal.locality,
                                  transportTypes: selectedTransportTypes
                                })
                              }>
                                { terminal.linkedTerminal.locality }
                              </Link>&nbsp;
                              (<Link to={
                              getNavigationQuery({
                                locality: terminal.locality,
                                linkedLocality: terminal.linkedTerminal.locality,
                                transportTypes: selectedTransportTypes
                              })
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

  const { setProperty, linksResult, selectedTerminal, intl } = props;

  const terminals = linksResult.links && linksResult.links.length > 0 ?
    (linksResult.links[0].arrivals || []).concat(linksResult.links[0].departures || [])
    : [];

  return (
    <div>
      <div className={s.linksList}>
        {
          terminals.map(terminal => renderDetailedLinkInfo(terminal, selectedTerminal, intl, setProperty))
        }
      </div>
    </div>
  );

};

const LinksView = (props) => {

  const {
    intl, linksResult, loadedLinksResult, loadedMapCenter, searchTerm, viewMode, linkMode,
    mapZoom, selectedLink, transportTypes, showTransportTypes, mapBoundsUpdated, query,
    selectedTransportTypes, selectedLocality, selectedLinkedLocality, selectedTerminal, selectedTag,
    getLinks, setProperty, navigate
  } = props;

  let displayLinksResult = linksResult || [];
  let displayLinks = displayLinksResult.links;
  let searchResultType = displayLinksResult.searchResultType;

  const onSelectLocality = (locality) => {

    setProperty('links.selectedLink', null);
    setProperty('links.searchTerm', '');
    setProperty('links.selectedLocality', locality);
    setProperty('links.linkMode', 'external');

    navigate(getNavigationPath({ locality, transportTypes: selectedTransportTypes }));
    //getLinks({ locality });
  };

  const onHighlightConnection = (terminal) => {
    if (terminal.highlighted) {
      setProperty('links.loadedMapCenter', null);
      setProperty('links.highlightedTerminal', terminal.uuid);
    }
    else if (!selectedLink) setProperty('links.highlightedTerminal', null);
  };

  const onSelectConnection = (terminal) => {
    if (selectedLink) selectedLink.selected = false;
    if (terminal.selected) {
      setProperty('links.loadedMapCenter', null);
      setProperty('links.selectedLink', terminal);
    }
    else setProperty('links.selectedLink', null);
  };

  let mapCenter = {
    lat: 60.16952,
    lng: 24.93545
  };

  /*
  if (displayLinks && displayLinks.length > 0) {
    if (!selectedLink) {
      mapCenter = {
        lat: displayLinks[0].latitude,
        lng: displayLinks[0].longitude
      };
    } else {
      mapCenter = {
        lat: selectedLink.linkedTerminal.latitude,
        lng: selectedLink.linkedTerminal.longitude
      };
    }
  }
   */

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
  if (searchResultType === 'connections') {
    if (displayLinks.length === 1) {
      searchHeader = (
        <div className={s.localityHeader}>
          <div className={s.localityName}>
            {displayLinks[0].locality}
          </div>
          <div className={s.undo}>
            <Link to={
              getNavigationQuery({
                transportTypes: selectedTransportTypes
              })
            }>
              <FontIcon className="material-icons" style={{ fontSize: '22px' }}>
                clear
              </FontIcon>
            </Link>
          </div>
        </div>
      );
      mapContent = renderConnectionsMap(displayLinks[0], selectedTransportTypes, actualLinkMode, selectedTerminal, onHighlightConnection, onSelectConnection, intl);
      listContent = renderConnectionsList(displayLinks[0], actualLinkMode, props);
    } else {
      mapContent = renderLocationsMap(displayLinks, onSelectLocality);
      listContent = renderLocationsList(displayLinks, selectedTransportTypes, onSelectLocality);
    }
  } else if (searchResultType === 'links') {
    searchHeader = (
      <div className={s.linksListHeader}>
        <div className={s.locality}>{ displayLinksResult.locality }</div>
        <div className={s.linkedLocality}>
          <Link to={
            getNavigationQuery({
              locality: displayLinksResult.linkedLocality,
              linkedLocality: displayLinksResult.locality,
              transportTypes: selectedTransportTypes
            })
          }>
            { displayLinksResult.linkedLocality }
          </Link>
        </div>
        <div className={s.undo}>
          <Link to={
            getNavigationQuery({
              locality: displayLinksResult.locality,
              transportTypes: selectedTransportTypes
            })
          }>
            <FontIcon className="material-icons" style={{ fontSize: '22px' }}>
              clear
            </FontIcon>
          </Link>
        </div>
      </div>
    );
    mapContent = renderLinksMap(props, onHighlightConnection, onSelectConnection);
    listContent = renderLinksList(props);
  } else {
    searchHeader = (
      <div className={s.taggedListHeader}>
        <div className={s.tag}>#{ selectedTag }</div>
        <div className={s.undo}>
          <Link to={
            getNavigationQuery({
              transportTypes: selectedTransportTypes
            })
          }>
            <FontIcon className="material-icons" style={{ fontSize: '22px' }}>
              clear
            </FontIcon>
          </Link>
        </div>
      </div>
    );
    mapContent = renderLinksMap(props, onHighlightConnection, onSelectConnection);
    listContent = renderLinksList(props);
  }


  const mapProps = {
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
    defaultCenter: mapCenter,
    defaultZoom: mapZoom ? mapZoom.zoomLevel : 10,
    onMapLoad: (map) => {
      if (map) {
        if ((mapZoom && mapZoom.updated !== mapBoundsUpdated) || query.view !== viewMode) {
          console.log('fit bounds', map, mapZoom, displayLinks);
          if (mapZoom) {
            map.fitBounds(mapZoom.bounds);
          } else {
            setProperty('links.viewMode', query.view);
            //map.fitBounds(displayLinks);
          }
        }
      }
    },
    onMapClick: () => {
      console.log('map clicked');
    },
    content: mapContent
  };

  if (selectedLink) {
    //mapProps.center = mapCenter;
  }

  if (loadedMapCenter) {
    //mapProps.center = loadedMapCenter;
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
                             setProperty('links.selectedLocality', null);
                             setProperty('links.selectedLinkedLocality', null);
                             navigate(getNavigationPath({ search: input, transportTypes: selectedTransportTypes }));
                             //getLinks({ ...(input.length === 0 ? {} : { locality: input }), transportTypes: selectedTransportTypes });
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
      <div>
        { searchHeader }
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

                    navigate(getNavigationPath({
                      locality: selectedLocality,
                      linkedLocality: selectedLinkedLocality,
                      search: searchTerm,
                      transportTypes: newSelectedTransportTypes
                    }));
                    //getLinks({ locality: searchTerm, transportTypes: newSelectedTransportTypes });

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
        (searchResultType === 'links' || searchResultType === 'tagged') ?
          <div className={s.linksView}>
            {
              (viewMode || query.view) === 'map' &&
                <div className={s.map}>
                  { mapView }
                </div>
            }
            <div className={s.list}>
              { listContent }
            </div>
          </div> :
          (((viewMode || query.view) === 'map') ? mapView : listContent)
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
      selectedLocality: state.links.selectedLocality,
      selectedLinkedLocality: state.links.selectedLinkedLocality,
      selectedTag: state.links.selectedTag,
      selectedTerminal: state.links.selectedTerminal,
      mapZoom: state.links.mapZoom,
      selectedLink: state.links.selectedLink,
      showTransportTypes: state.links.showTransportTypes,
      selectedTransportTypes: state.links.selectedTransportTypes || []
    }
  }, {
    getLinks,
    setZoomLevel,
    setProperty,
    navigate
  })(withStyles(s)(LinksView))
);
