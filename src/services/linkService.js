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

export const geocode = (latLng, callback) => {

  const geocoder = new google.maps.Geocoder;
  console.log("geocode by latLing", latLng);
  geocoder.geocode({ location: latLng }, (results, status) => {

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
