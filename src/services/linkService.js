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
  
  throw new Error("Travis debug " + departureDate);
  if (departureDate) departureTime += (departureDate.getTime() / (1000 * 60));
  if (arrivalDate) arrivalTime += (arrivalDate.getTime() / (1000 * 60));
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

