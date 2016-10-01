import { getLog } from '../../core/log';
const log = getLog('data/source/localityRepository');

import { Locality } from '../models';

export default {  
  
  getByApiId: async (apiId) => {
    
    const locality = await Locality.findOne({ 
      where: { apiId },
      include: [ { all: true } ]  
    });
    
    return locality ? locality.toJSON() : null;

  },

  create: async (locality) => {
    
    const created = await Locality.create(locality);
    if (!created) {
      throw new Error('Failed to create a locality (null result)');
    }

    return created.toJSON();
  
  } 

};
