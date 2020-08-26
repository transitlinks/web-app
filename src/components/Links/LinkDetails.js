import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { setProperty } from '../../actions/properties';
import { getNavigationQuery } from '../utils';
import s from './LinkDetails.css';
import Link from '../Link';

import { injectIntl } from 'react-intl';
import FontIcon from 'material-ui/FontIcon';
import msgTransport from '../common/messages/transport';

const LinkDetails = ({
  intl, terminal, selectedTransportTypes, setProperty
}) => {

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

      const time = new Date(terminal.utcDateTime).getTime();
      const linkedTime = new Date(terminal.linkedTerminal.utcDateTime).getTime();

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

  return (
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
        <div className={s.terminalAddresses}>
          <div className={s.terminalFrom}>
            <div className={s.terminalLocality}>
              <Link to={
                getNavigationQuery({
                  locality: fromTerminal.locality,
                  transportTypes: selectedTransportTypes
                }) + '&view=map'
              }>
                { fromTerminal.locality }
              </Link>
            </div>
          </div>
          <div className={s.terminalTo}>
            <div className={s.terminalLocality}>
              <Link to={
                getNavigationQuery({
                  locality: toTerminal.locality,
                  transportTypes: selectedTransportTypes
                }) + '&view=map'
              }>
                { toTerminal.locality }
              </Link>
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
                <span className={s.content}>{ terminal.priceAmount || terminal.linkedTerminal.priceAmount } { terminal.priceCurrency } </span>
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
                  #<Link to={`/links?tag=${tag.tag}&user=${tag.userUuid}&view=map`}>{tag.tag}</Link>
                </div>
              );
            })
          }
        </div>
      }
    </div>
  );

};

LinkDetails.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
  }), {
    setProperty
  })(withStyles(s)(LinkDetails))
);
