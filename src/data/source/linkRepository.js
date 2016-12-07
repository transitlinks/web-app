import { getLog } from '../../core/log';
const log = getLog('data/source/linkRepository');

import Sequelize from 'sequelize';
import fetch from '../../core/fetch';
import { PLACES_API_URL, PLACES_API_KEY } from '../../config';
import { TransitLink, LinkInstance, TransportType, Locality, Rating } from '../models';

const getInstancesByUserId = async (userId) => {
  
  const linkInstances = await LinkInstance.findAll({ 
    where: { userId },
    include: [
      { model: TransportType, as: 'transport' },
      { model: TransitLink, as: 'link', include: [ { all: true } ] } 
     ]
  });
  
  return linkInstances.map(linkInstance => linkInstance.json());

};

const getInstanceByUuid = async (uuid) => {

  const linkInstance = await LinkInstance.findOne({ 
    where: { uuid },
    include: [
      { model: TransportType, as: 'transport' },
      { model: TransitLink, as: 'link', include: [ { all: true } ] } 
     ] 
  });
  
  if (!linkInstance) {
    return null;
  }

  const ratingResults = await Rating.findAll({
    attributes: [
      'property',
      [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating']
    ],
    where: { linkInstanceId: linkInstance.id, rating: { $ne: null } },
    group: [ 'property' ]
  });
  
  const ratings = {};
  ratingResults.forEach(result => {
    const propertyName = result.get('property').charAt(0).toUpperCase() + result.get('property').slice(1);
    ratings[`avg${propertyName}Rating`] = result.get('avgRating');
  });
  
  return { ...linkInstance.json(), ...ratings };

};

export default {
  
  getByUuid: async (uuid) => {
    
		let link = await TransitLink.findOne({ 
      where: { uuid },
      include: [ { all: true } ] 
    });
    
		if (link === null) {
			return null;
		}
			
		let instances = await LinkInstance.findAll({
			where: { linkId: link.id },
			include: [
				{ model: TransportType, as: 'transport' }
			]
		});

    const ratingResults = await Rating.findAll({
      attributes: [
        'property',
        'linkInstanceId',
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating']
      ],
      where: { linkInstanceId: { $in: instances.map(instance => instance.id) }, rating: { $ne: null } },
      group: [ 'linkInstanceId', 'property' ]
    });
    
    const ratings = {};
    ratingResults.forEach(result => {
      const linkInstanceId = result.get('linkInstanceId');
      if (!ratings[linkInstanceId]) {
        ratings[linkInstanceId] = {};
      }
      const propertyName = result.get('property').charAt(0).toUpperCase() + result.get('property').slice(1);
      ratings[linkInstanceId][`avg${propertyName}Rating`] = result.get('avgRating');
    });
     
		link = link.toJSON();
		
    return Object.assign(link, {
			instances: instances.map(instance => ({ ...instance.toJSON(), ...ratings[instance.id] }))
		});
  	
	},
  
  getInstanceByUuid: getInstanceByUuid,
  
  getInstancesByUserId: getInstancesByUserId,
   
  getByLocalityId: async (localityId) => {
  
    const links = await TransitLink.findAll({ 
      where: { $or: [{ fromId: localityId }, { toId: localityId }] },
      include: [ { all: true } ] 
    });
    
    return links.map(link => link.toJSON());
  
  },
  
	getByLocalityName: async (input) => {
  	
		const localities = await Locality.findAll({
			where: { name: { $like: `%${input}%` } }
		});
		
		if (localities.length === 0) {
			return [];
		}
		
		const localityIds = localities.map(locality => locality.id);
    const links = await TransitLink.findAll({
      where: { 
				$or: [
					{ fromId: { $in: localityIds } }, 
					{ toId: { $in: localityIds } }
				]
			},
      include: [ 
        { model: Locality, as: 'from', attributes: [ 'description' ] },
        { model: Locality, as: 'to', attributes: [ 'description' ] }
      ]
    });

    const linkResults = await Promise.all(links.map(async link => {
      const instanceCount = await LinkInstance.count({ where: { linkId: link.id } });
      return Object.assign(link.toJSON(), { instanceCount });
    }));

    return linkResults;
  
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
  
	getTransportTypes: async () => {
    const transportTypes = await TransportType.findAll();
    return transportTypes.map(transportType => transportType.toJSON());
  },

	getTransportBySlug: async (slug) => {
    const transport = await TransportType.findOne({
			where: { slug }
		});
    return transport ? transport.toJSON() : null;
  },
  
	createInstance: async (linkInstance) => {
    
    let created = await LinkInstance.create(linkInstance);
    
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

  saveInstanceRatings: async (linkInstanceId, ratings) => {
    
    await Promise.all(ratings.map(async rating => {
      await Rating.create({ linkInstanceId, ...rating });
    }));
  
  },

  update: async (link) => {
    const updated = await TransitLink.update(link, { where: { id: link.id } });
    log.trace('update result', result);
    return updated.toJSON();
  }, 
  
  updateInstance: async (linkInstance) => {
  
    const result = await LinkInstance.update(linkInstance, { 
      where: { uuid: linkInstance.uuid } 
    });
    if (result.length !== 1 || result[0] !== 1) {
      throw new Error(`Invalid link instance update result: ${result}`);
    }
    
    return getInstanceByUuid(linkInstance.uuid);    
     
  } 

};
