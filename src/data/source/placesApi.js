import { getLog } from '../../core/log';
const log = getLog('data/sources/placesApi');

import fetch from '../../core/fetch';
import { PLACES_API_URL, PLACES_API_KEY } from '../../config';

export default {
  
  autocomplete: async (input, types, location, radius) => {
    
    let url = `${PLACES_API_URL}/autocomplete/json` +
      `?input=${input}`;
    
    if (types) url += `&types=${types}`;
    if (location) url += `&location=${location}`;
    if (radius) url += `&radius=${radius}`;
    
    url += `&key=${PLACES_API_KEY}`;
    
    log.debug("SEARCH PLACES API", input, types, location, radius, url);
    const response = await fetch(url);
    if (response.status !== 'OK') {
      const status = response.status || response.statusCode;
      throw new Error(`Invalid Places API response (${status})`);
    }

    return response.predictions;
    
  },

  getDetails: async (apiId) => {
    
    const url = `${PLACES_API_URL}/details/json` +
      `?placeid=${apiId}&key=${PLACES_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.result || !response.result.geometry) {
      throw new Error(
        `Invalid Places API response (placeId ${apiId}): ` +
        `${response.statusCode}`
      );
    }

    return response.result;
    
  }

};
