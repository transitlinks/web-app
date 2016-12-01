import { getLog } from '../../core/log';
const log = getLog('data/source/userRepository');

import { User } from '../models';

export const getByUuid = async (uuid) => {
  const user = await User.findOne({ where: { uuid } });
  return user.toJSON();
};

export const create = async (user) => {
    
  const created = await User.create(user);
  if (!created) {
    throw new Error('Failed to create a user (null result)');
  }

  return created.toJSON();
  
}; 
  
export const update = async (uuid, values) => {
  const result = await User.update(values, { where: { uuid } });
  return getByUuid(uuid);
};
