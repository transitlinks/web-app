import { getLog } from '../../core/log';
const log = getLog('data/source/userRepository');

import { User } from '../models';

export default {  
  
  getByUuid: async (uuid) => {
    
    const user = await User.findOne({ where: { uuid } });
    return user.toJSON();

  },

  create: async (user) => {
    
    const created = await User.create(user);
    if (!created) {
      throw new Error('Failed to create a user (null result)');
    }

    return created.toJSON();
  
  } 

};
