import { getLog } from './log';
const log = getLog('core/auth');

import bcrypt from 'bcrypt-nodejs';
import { User, UserLogin } from '../data/models';

export const login = async ({ email, password, photo }) => {
  
  log.debug('login', `email=${email}`);
  
  let user = await User.findOne({ where: { email } });
  if (!user) {
    log.debug('login', 'create-user', `email=${email}`, `photo=${photo}`, `password=${password}`);
    const pwdHash = !(password && password.length > 0) ? null :
      bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    user = await User.create({
      email,
      photo,
      password: pwdHash
    });
  }
  
  if (user) {

    if (photo) {
      await User.update({ photo }, { where: { id: user.id } });
    }

    log.debug('getUser', 'user-found', `user.uuid=${user.get('uuid')}`);
    
    if (password) {
      if (!bcrypt.compareSync(password, user.get('password'))) {
        throw new Error('invalid-password');
      }
    }

    return user.json();
  
  }

};
