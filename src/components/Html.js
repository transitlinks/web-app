import React, { PropTypes } from 'react';
import { MAPS_JS_API_KEY, GA_TRACKING_ID } from '../config';

function Html({ title, description, style, script, children, lang, state }) {

  return (
    <html className="no-js" lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <link rel="stylesheet" href="/css/material-icons.css" />
        <link rel="stylesheet" href="/css/common.css" />
        <style id="css" dangerouslySetInnerHTML={{ __html: style }} />
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
        {
          script && (
          <script
            id="source"
            src={script}
            data-initial-state={JSON.stringify(state)}
          />
        )}
        {
          GA_TRACKING_ID &&
          <script
            dangerouslySetInnerHTML={{ __html:
            'window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;' +
            `ga('create','${GA_TRACKING_ID}','auto');ga('send','pageview')` }}
          />
        }
        {
          GA_TRACKING_ID &&
          <script src="https://www.google-analytics.com/analytics.js" async defer />
        }
        <script async defer
          src={`https://maps.googleapis.com/maps/api/js?key=${MAPS_JS_API_KEY}&callback=initMap`} type="text/javascript">
        </script>
      </body>
    </html>
  );
}

Html.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  style: PropTypes.string.isRequired,
  script: PropTypes.string,
  children: PropTypes.string,
  state: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
};

export default Html;
