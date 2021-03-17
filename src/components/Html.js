import React, { PropTypes } from 'react';
import { MAPS_JS_API_KEY } from '../config';

function Html({ title, description, style, script, children, lang, state }) {

  return (
    <html className="no-js" lang={lang}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WJY0GVR87Z"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-WJY0GVR87Z');
        ` }} />
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
          )
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
