import { getLog } from '../../core/log';
const log = getLog('data/source/linkRepository');

import Sequelize from 'sequelize';
import fetch from '../../core/fetch';
import { PLACES_API_URL, PLACES_API_KEY } from '../../config';
import { TransitLink, LinkInstance, TransportType, Locality, Rating } from '../models';

export default {
  
  getById: async (id) => {
    
		let link = await TransitLink.findById(id, { include: [ { all: true } ] });
    
		if (link === null) {
			return null;
		}
		
		link = link.toJSON();
		
		const instances = await LinkInstance.findAll({
			where: { linkId: id },
			include: [
				{ model: TransportType, as: 'transport' }
			]
		});

    const getAvgRating = async (linkInstanceId, property) => {
      
      const result = await Rating.findOne({
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating']
        ],
        where: { linkInstanceId, property }
      });

      return result ? result.avgRating : null;

    };

    const ratings = {};
    await Promise.all(instances.map(async instance => {
      if (!ratings[instance.id]) {
        ratings[instance.id] = {};
      }
      ratings[instance.id].avgAvailabilityRating = await getAvgRating(instance.id, 'availability');
      ratings[instance.id].avgDepartureRating = await getAvgRating(instance.id, 'departure');
      ratings[instance.id].avgArrivalRating = await getAvgRating(instance.id, 'arrival');
      ratings[instance.id].avgAwesomeRating = await getAvgRating(instance.id, 'awesome');
    }));

		return Object.assign(link, {
			instances: instances.map(instance => ({ ...instance.toJSON(), ...ratings[instance.id] }))
		});
  	
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
  
  } 

};
