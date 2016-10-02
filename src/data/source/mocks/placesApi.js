const data = {
  'moscow': {
    formatted_address: 'Moscow, Russia',
    geometry: {
      location: {
        lat: 54.8171,
        lng: 49.8716
      }
    }
  },
  'helsinki': {
    formatted_address: 'Helsinki, Finland',
    geometry: {
      location: {
        lat: 54.8171,
        lng: 49.8716
      }
    }
  }
}

export default {
  
  autocomplete: async (input) => {
    
    return Object.keys(data).map(key => ({
      description: data[key].formatted_address,
      place_id: key
    }));
    
  },

  getDetails: async (apiId) => {
    return data[apiId];
  }

};
