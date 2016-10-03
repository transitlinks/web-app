import { getLog } from '../../core/log';
const log = getLog('data/source/linkRepository');

import fetch from '../../core/fetch';
import { PLACES_API_URL, PLACES_API_KEY } from '../../config';
import { TransitLink, LinkInstance, TransportType, Locality } from '../models';

export default {
  
  getById: async (id) => {
    const link = await TransitLink.findById(id, { include: [ { all: true } ] });
    return link ? link.toJSON() : null;
  },
  
	getInstanceById: async (id) => {
    const linkInstance = await LinkInstance.findById(id, {
			include: [
				{ model: TransportType, as: 'transport' },
				{ model: TransitLink, as: 'link', include: [ { all: true } ] } 
			 ] 
		});
    return linkInstance ? linkInstance.toJSON() : null;
  },
  
  getByLocalityId: async (localityId) => {
  
    const links = await TransitLink.findAll({ 
      where: { $or: [{ fromId: localityId }, { toId: localityId }] },
      include: [ { all: true } ] 
    });
    
    return links.map(link => link.toJSON());
  
  },

  getByEndpoints: async (fromId, toId) => {
    const link = await TransitLink.findOne({
			where: { $and: [{ fromId }, { toId }] },
			include: [ { all: true } ] 
		});
    return link ? link.toJSON() : null;
  },

  create: async ({ fromId, toId }) => {
    
    let created = await TransitLink.create({
      fromId,
      toId
    });
    
    if (!created) {
      throw new Error('Failed to create a link (null result)');
    }

    created = await TransitLink.findById(created.id, 
      { include: [ { all: true } ] });
    
    return created.toJSON();

  },
  
	getTransportBySlug: async (slug) => {
    const transport = await TransportType.findOne({
			where: { slug }
		});
    return transport ? transport.toJSON() : null;
  },
  
	createInstance: async ({ linkId, transportId }) => {
    
    let created = await LinkInstance.create({
      linkId,
      transportId
    });
    
    if (!created) {
      throw new Error('Failed to create a link instance (null result)');
    }
		
    created = await LinkInstance.findById(created.id, {
			include: [
				{ model: TransportType, as: 'transport' },
				{ model: TransitLink, as: 'link', include: [ { all: true } ] } 
			 ] 
		});
    
    return created.toJSON();

  },

  update: async (link) => {
  
    const updated = await TransitLink.update(link, { where: { id: link.id } });
    log.trace('update result', result);
    return updated.toJSON();
  
  } 

};
