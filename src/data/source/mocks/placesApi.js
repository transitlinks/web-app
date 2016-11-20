const data = {
  'moscow': {
    name: 'Moscow',
    formatted_address: 'Moscow, Russia',
    address_components: [
      {
        long_name: 'City of Moscow',
        short_name: 'Moscow',
        types: [
          'locality',
          'political'
        ]
      },
      {
        long_name: 'Russia',
        short_name: 'RU',
        types: [
          'country',
          'political'
        ]
      }
    ],
    geometry: {
      location: {
        lat: 54.8171,
        lng: 49.8716
      }
    }
  },
  'helsinki': {
    name: 'Helsinki',
    formatted_address: 'Helsinki, Finland',
    address_components: [
      {
        long_name: 'Municipality of Helsinki',
        short_name: 'Helsinki',
        types: [
          'locality',
          'political'
        ]
      },
      {
        long_name: 'Finland',
        short_name: 'FI',
        types: [
          'country',
          'political'
        ]
      }
    ],
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
      place_id: key,
      terms: data[key].address_components.map(cmp => ({
        name: key,
        value: cmp.long_name
      }))
    }));
    
  },

  getDetails: async (apiId) => {
    return data[apiId];
  }

};
