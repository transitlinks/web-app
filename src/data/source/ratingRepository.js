import { getLog } from '../../core/log';
const log = getLog('data/source/ratingRepository');

import Sequelize from 'sequelize';

import { Rating, User } from '../models';

export const getAverages = async (instanceIds) => {
  
  const ratingResults = await Rating.findAll({
    attributes: [
      'property',
      'linkInstanceId',
      [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating']
    ],
    where: { linkInstanceId: { $in: instanceIds }, rating: { $ne: null } },
    group: [ 'linkInstanceId', 'property' ]
  });

  return ratingResults.map(result => result.toJSON());

};

export const getInstanceRatingsByUser = async (linkInstanceId, userId) => {
  
  const ratings = await Rating.findAll({ 
    where: { linkInstanceId, userId } 
  });
  
  return ratings.map(rating => rating.toJSON());

};

export const saveRating = async (rating) => {

  const existing = await Rating.findOne({ 
    where: { 
      userId: rating.userId, 
      linkInstanceId: rating.linkInstanceId,
      property: rating.property 
    }
  });
  
  let saved = null;
  if (existing) {
    await Rating.update(
      { rating: rating.rating }, 
      { where: { id: existing.id } }
    );
    saved = await Rating.findOne({ id: rating.id });
  } else {
    saved = await Rating.create(rating);
  }

  return saved.toJSON();

};
