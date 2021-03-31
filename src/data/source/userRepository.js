import { getLog } from '../../core/log';
const log = getLog('data/source/userRepository');

import { User } from '../models';
import sequelize from '../sequelize';

export const getUserIdByUuid = async (uuid) => {

  const user = await User.findOne({
    attributes: [ 'id' ],
    where: { uuid }
  });

  return user ? user.id : null;

};

export const getUserUuidById = async (id) => {

  const user = await User.findOne({
    attributes: [ 'uuid' ],
    where: { id }
  });

  return user.uuid;

};

export const getById = async (id) => {

  const user = await User.findOne({ where: { id } });
  if (!user) {
    throw new Error('User not found');
  }
  return user;

};

export const getByUuid = async (uuid) => {
  const user = await User.findOne({ where: { uuid } });
  return user;
};

export const getByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user.toJSON();
};

export const getUser = async (where) => {
  const user = await User.findOne({ where });
  return user;
};

export const create = async (user) => {

  const created = await User.create(user);
  if (!created) {
    throw new Error('Failed to create a user (null result)');
  }

  return created.toJSON();

};

export const getUsersBySearchTerm = async (limit, offset, search) => {
  const query = `SELECT "id", "firstName", "lastName", "uuid" FROM "User" WHERE "firstName" ILIKE '%${search}%' OR "lastName" ILIKE '%${search}%' OR "username" ILIKE '%${search}%' LIMIT ${limit} OFFSET ${offset}`;
  const matchingUsers = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  return matchingUsers;
};

export const update = async (uuid, values) => {
  const result = await User.update(values, { where: { uuid } });
  return getByUuid(uuid);
};
