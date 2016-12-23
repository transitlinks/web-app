import assert from 'assert';
import {
  calcInstanceRating,
  calcTransitDuration
} from '../../../src/services/linkService';

describe('services/linkService', () => {

  it('should calculate link instance rating', () => {
    
    assert.equal(calcInstanceRating({
      avgAvailabilityRating: 5,
      avgAwesomeRating: 3
    }), 4);
    
    assert.equal(calcInstanceRating({
      avgAvailabilityRating: 5,
      avgDepartureRating: 3,
      avgArrivalRating: 3,
      avgAwesomeRating: 5
    }), 4);

  });
  
  it('should calculate duration', () => {

    const date = new Date();
    assert.equal(calcTransitDuration({
      durationMinutes: 15
    }), 15);
    
    assert.equal(calcTransitDuration({
      departureDate: date,
      arrivalDate: new Date(date.getTime() + (48 * 60 * 60 * 1000))
    }), (48 * 60));
    
    assert.equal(calcTransitDuration({
      departureHour: 15,
      departureMinute: 30,
      arrivalHour: 12,
      arrivalMinute: 30
    }), (21 * 60));
  
  });

}); 
