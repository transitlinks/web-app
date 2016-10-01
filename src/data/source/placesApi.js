import fetch from '../../core/fetch';
import { PLACES_API_URL, PLACES_API_KEY } from '../../config';

export default {
  
  autocomplete: async (input) => {
    
    const url = `${PLACES_API_URL}/autocomplete/json` +
      `?input=${input}&types=(cities)&key=${PLACES_API_KEY}`;

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
