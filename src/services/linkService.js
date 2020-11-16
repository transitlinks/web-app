import cc from "currency-codes";

export const createRatingsMap = (ratings) => {

  const ratingsMap = {};
  ratings.forEach(rating => {
    const linkInstanceId = rating.linkInstanceId;
    if (!ratingsMap[linkInstanceId]) {
      ratingsMap[linkInstanceId] = {};
    }
    const propertyName = rating.property.charAt(0).toUpperCase() + rating.property.slice(1);
    ratingsMap[linkInstanceId][`avg${propertyName}Rating`] = rating.avgRating;
  });

  return ratingsMap;

};

export const calcInstanceRating = (instance) => {

  const {
    avgAvailabilityRating,
    avgDepartureRating,
    avgArrivalRating,
    avgAwesomeRating
  } = instance;

  let divisor = 0;
  let ratingSum = 0;

  if (avgAvailabilityRating) {
    divisor += 1;
    ratingSum += parseFloat(avgAvailabilityRating);
  }

  if (avgDepartureRating) {
    divisor += 1;
    ratingSum += parseFloat(avgDepartureRating);
  }

  if (avgArrivalRating) {
    divisor += 1;
    ratingSum += parseFloat(avgArrivalRating);
  }

  if (avgAwesomeRating) {
    divisor += 1;
    ratingSum += parseFloat(avgAwesomeRating);
  }

  return divisor > 0 ? ratingSum / divisor : null;

};

export const calcTransitDuration = (instance) => {

  const {
    departureDate, departureHour, departureMinute,
    arrivalDate, arrivalHour, arrivalMinute,
    durationDays, durationHours, durationMinutes
  } = instance;

  let departureTime = 0;
  let arrivalTime = 0;

  if (durationDays) arrivalTime += durationDays * 24 * 60;
  if (durationHours) arrivalTime += durationHours * 60;
  if (durationMinutes) arrivalTime += durationMinutes;

  if (arrivalTime > 0) {
    return arrivalTime;
  }

  const getDate = (date) => {
    if (date instanceof Date) {
      return date;
    } else {
      return new Date(date);
    }
  };

  if (departureDate) departureTime += (getDate(departureDate).getTime() / (1000 * 60));
  if (arrivalDate) arrivalTime += (getDate(arrivalDate).getTime() / (1000 * 60));
  if (departureHour) departureTime += departureHour * 60;
  if (arrivalHour) arrivalTime += arrivalHour * 60;
  if (departureMinute) departureTime += departureMinute;
  if (arrivalMinute) arrivalTime += arrivalMinute;

  if (departureDate && arrivalDate) {
    return arrivalTime - departureTime;
  } else if (departureHour && arrivalHour) {
    const duration = ((arrivalHour * 60) + arrivalMinute) -
      ((departureHour * 60) + departureMinute);
    return duration > 0 ? duration : (24 * 60) + duration;
  } else {
    return null;
  }

};

export const reverseGeocode = (placeId, callback) => {

  const geocoder = new google.maps.Geocoder;
  console.log("reverse geocode by placeId", placeId);
  geocoder.geocode({ placeId }, (results, status) => {
    if (status === 'OK') {
      if (results[0]) {
        callback(results[0]);
      } else {
        console.error('No geocoding results');
      }
    } else {
      console.error('Geocoder error', status);
    }
  });

};

const getLevelFromType = (types, level) => {

  if (level === 'results') {
    if (
      types.includes('airport') ||
      types.includes('transit_station')
    ) return 10000;
  }

  if (types.includes('locality')) {
    if (types.includes('colloquial_area')) return 10000;
    return 1000;
  }

  if (types[0].substring(0, 26) === 'administrative_area_level_') {
    try {
      return parseInt(types[0].substring(26, 27));
    } catch (error) {
      return 0;
    }
  }
  return 0;
};

const compareAdminAreaLevel = (a, b, level) => {
  return getLevelFromType(b.types, level) - getLevelFromType(a.types, level);
};

const extractLocality = (results) => {
  const sortedResults = results.sort((a, b) => compareAdminAreaLevel(a, b, 'results'));
  const sortedComponents = sortedResults[0].address_components.sort((a, b) => compareAdminAreaLevel(a, b, 'address'));
  return sortedComponents[0].long_name;
};

const extractCountry = (results) => {
  for (let i = 0; i < results.length; i++) {
    const { types } = results[i];
    if (types.includes('country')) {
      const addressComponents = results[i].address_components;
      for (let j = 0; j < addressComponents.length; j++) {
        if (addressComponents[j].types.includes('country')) {
          return addressComponents[j].long_name;
        }
      }
    }
  }
};

const eligibleLocalityTypes = (types) => {
};

const extractLocalityOptions = (results) => {
  return results.flatMap(result => {
    return result.address_components
      .filter(cmp => cmp.types.find(type => [
        'locality',
        'administrative_area_level_1',
        'administrative_area_level_2',
        'administrative_area_level_3',
        'colloquial_area'
      ].includes(type)))
      .map(cmp => cmp.long_name);
  }).filter((value, index, self) => self.indexOf(value) === index);
};

export const geocode = (latLng, callback) => {

  const geocoder = new google.maps.Geocoder;
  console.log('geocode by latLing', latLng);
  geocoder.geocode({ location: latLng }, (results, status) => {

    console.log('RESULTS', results);
    if (status === 'OK') {
      if (results.length > 0) {
        callback({
          result: results[0],
          locality: extractLocality(results),
          country: extractCountry(results),
          localityOptions: extractLocalityOptions(results)
        });
      } else {
        console.error('No geocoding results');
      }
    } else {
      console.error('Geocoder error', status);
    }
  });

};

export const extractPlaceFields = (location) => {

  const fields = {
    placeId: location.place_id
  };

  if (location.formatted_address) {
    fields.formattedAddress = location.formatted_address;
  } else {
    fields.formattedAddress = location.address_components.formatted_address;
  }

  let adminAreaLevel = 0;

  for (let i = 0; i < location.address_components.length; i++) {

    const {types, long_name} = location.address_components[i];

    for (let j = 0; j < types.length; j++) {
      const addrComponentType = types[j];
      if (addrComponentType.substring(0, 26) === 'administrative_area_level_') {
        console.log('Examine admin area level', addrComponentType);
        try {
          const newAdminAreaLevel = parseInt(addrComponentType.substring(26, 27));
          if (newAdminAreaLevel > adminAreaLevel) {
            fields.locality = long_name;
            adminAreaLevel = newAdminAreaLevel;
            console.log('Set admin area as locality:', fields.locality);
          }
        } catch (error) {
          console.log('ERROR PARSING ADMIN AREA LEVEL', error);
        }
      }
    }

    if (types.indexOf('locality') !== -1) {
      fields.locality = long_name;
      adminAreaLevel = 1000;
    }

    if (types.indexOf('country') !== -1) {
      fields.country = long_name;
    }

    if (fields.locality && fields.country) {
      return fields;
    }

  }

  return fields;

};

export const getAvailableCurrencies = (destination) => {

  const currencyCodes = {
  };

  const countries = cc.countries();

  const matchingCountries = countries.filter(country => {
    return country.indexOf(destination) !== -1 || destination.indexOf(country) !== -1;
  });

  if (matchingCountries.length > 0) {
    cc.country(matchingCountries[0]).forEach(currency => {
      currencyCodes[currency.code] = currency;
    });
  }

  currencyCodes['USD'] = cc.code('USD');
  currencyCodes['EUR'] = cc.code('EUR');
  currencyCodes['GBP'] = cc.code('GBP');

  return currencyCodes;

};

export const getMapBounds = (linkStats, linkMode) => {

  let coords = [];

  const collectCoords = (terminal) => {
    return [ { lat: terminal.latitude, lng: terminal.longitude } ]
          .concat(
            terminal.linkedTerminal ?
              [ { lat: terminal.linkedTerminal.latitude, lng: terminal.linkedTerminal.longitude } ] :
              []
          );
  };

  linkStats.forEach(linkStat => {

    if (linkMode !== 'internal') {
      coords = coords.concat((linkStat.departures || []).flatMap(dep => collectCoords(dep)));
      coords = coords.concat((linkStat.arrivals || []).flatMap(arr => collectCoords(arr)));
    }

    coords = coords.concat((linkStat.internal || []).map(dep => ({ lat: dep.latitude, lng: dep.longitude })));

  });

  const bounds = new google.maps.LatLngBounds();
  coords.forEach(coord => {
    bounds.extend(new google.maps.LatLng(coord));
  });
  return bounds;
};

export const getBoundsZoomLevel = (bounds, mapDim) => {

  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 10;

  const latRad = (lat) => {
    const sin = Math.sin(lat * Math.PI / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  };

  const zoom = (mapPx, worldPx, fraction) => {
    return Math.floor(Math.log(Math.abs(mapPx / worldPx / fraction)) / Math.LN2);
  };

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

  const lngDiff = ne.lng() - sw.lng();
  const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

  const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);
  const zoomLevel = Math.min(latZoom, lngZoom, ZOOM_MAX);
  return zoomLevel;

};

export const updateLastCoords = (lastCoords, prevLastCoords, saveTripCoord, getLastCoords) => {

  console.log('UPDATE LAST COORDS', lastCoords, prevLastCoords);
  let lastChecked = 0;
  if (lastCoords) {
    lastChecked = (new Date()).getTime() - lastCoords.receivedAt;
    console.log('LAST CHECKED', lastChecked);
    if (!prevLastCoords || (
      lastCoords.latitude !== prevLastCoords.latitude &&
      lastCoords.longitude !== prevLastCoords.longitude
    )) {
      saveTripCoord({
        latitude: lastCoords.latitude,
        longitude: lastCoords.longitude,
      });
    }
  }

  if (!lastCoords || lastChecked > 60000) {
    console.log('GET LAST COORDS');
    getLastCoords();
  }

};

