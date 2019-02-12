import sequelize from '../sequelize';
import User from './User';
import Locality from './Locality';
import TransitLink from './TransitLink';
import LinkInstance from './LinkInstance';
import TransportType from './TransportType';
import Rating from './Rating';
import MediaItem from './MediaItem';
import Comment from './Comment';
import Post from './Post';
import CheckIn from './CheckIn';
import Terminal from './Terminal';

User.hasMany(Rating, {
  foreignKey: 'userId'
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

TransitLink.belongsTo(Locality, {
  foreignKey: 'fromId',
  as: 'from'
});

TransitLink.belongsTo(Locality, {
  foreignKey: 'toId',
  as: 'to'
});

LinkInstance.belongsTo(TransitLink, {
  foreignKey: 'linkId',
  as: 'link'
});

LinkInstance.belongsTo(TransportType, {
  foreignKey: 'transportId',
  as: 'transport'
});

LinkInstance.hasMany(Rating, {
  foreignKey: 'linkInstanceId'
});

LinkInstance.hasMany(MediaItem, {
  foreignKey: 'linkInstanceId'
});

LinkInstance.hasMany(Comment, {
  foreignKey: 'linkInstanceId'
});

Comment.hasMany(Comment, {
  foreignKey: 'replyToId'
});

LinkInstance.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

CheckIn.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

CheckIn.hasMany(Post, {
  foreignKey: 'checkInId'
});

CheckIn.hasOne(CheckIn, {
  foreignKey: 'nextCheckInId',
  as: 'next'
});

CheckIn.hasOne(CheckIn, {
  foreignKey: 'prevCheckInId',
  as: 'prev'
});

Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Terminal.belongsTo(CheckIn, {
  foreignKey: 'checkInId',
  as: 'checkIn'
});

function sync(...args) {
  return sequelize.sync(...args);
}

export default { sync };
export { User, Locality, TransitLink, LinkInstance, TransportType, Rating, MediaItem, Comment, Post, CheckIn, Terminal };
