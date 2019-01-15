const localitiesData = {
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
};

const placesData = {
  'address-moscow': {
    name: 'Manege Square',
    formatted_address: 'Manege Square, Moscow, Russia',
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
  'address-helsinki': {
    name: 'Mannerheimintie',
    formatted_address: 'Mannerheimintie, Helsinki, Finland',
    address_components: [
      {
        long_name: 'Municipality of Helsinki',
        short_name: 'Helsinki',
        types: [
          'street'
        ]
      },
      {
        long_name: 'Finland',
        short_name: 'FI',
        types: [
          'street'
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

  autocomplete: async (input, types, location, radius) => {

    const data = types === '(cities)' ? localitiesData : placesData;
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
    const data = apiId.substring(0, 4) === 'addr' ?
      placesData : localitiesData;
    return data[apiId];
  }

};
