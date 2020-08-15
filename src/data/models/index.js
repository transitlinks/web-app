import sequelize from '../sequelize';
import User from './User';
import Locality from './Locality';
import TransitLink from './TransitLink';
import TransportType from './TransportType';
import MediaItem from './MediaItem';
import Comment from './Comment';
import Post from './Post';
import CheckIn from './CheckIn';
import Terminal from './Terminal';
import Tag from './Tag';
import EntityTag from './EntityTag';
import Like from './Like';

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Comment.belongsTo(CheckIn, {
  foreignKey: 'checkInId',
  as: 'checkIn'
});

Comment.belongsTo(Terminal, {
  foreignKey: 'terminalId',
  as: 'terminal'
});

TransitLink.belongsTo(Locality, {
  foreignKey: 'fromId',
  as: 'from'
});

TransitLink.belongsTo(Locality, {
  foreignKey: 'toId',
  as: 'to'
});

Comment.hasMany(Comment, {
  foreignKey: 'replyToId'
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

Terminal.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Terminal.belongsTo(CheckIn, {
  foreignKey: 'checkInId',
  as: 'checkIn'
});

Terminal.hasOne(Terminal, {
  foreignKey: 'linkedTerminalId',
  as: 'linkedTerminal'
});

CheckIn.belongsToMany(Tag, {
  through: 'EntityTag',
  as: 'tags',
  foreignKey: 'checkInId'
});

Tag.belongsToMany(CheckIn, {
  through: 'EntityTag',
  as: 'checkIns',
  foreignKey: 'tagId'
});

Like.belongsTo(User, {
  foreignKey: 'userId'
});

function sync(...args) {
  return sequelize.sync(...args);
}

export default { sync };
export { User, Locality, TransitLink, TransportType, Like, MediaItem, Comment, Post, CheckIn, Terminal, Tag, EntityTag };
