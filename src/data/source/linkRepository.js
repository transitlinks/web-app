import { getLog } from '../../core/log';
const log = getLog('data/source/linkRepository');
import { TransportType, MediaItem } from '../models';

export default {

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

  saveInstanceMedia: async (linkInstanceId, mediaItem) => {
    const created = await MediaItem.create({ linkInstanceId, ...mediaItem });
    return created.toJSON();
  },

  getMediaItems: async (params) => {
    const mediaItems = await MediaItem.findAll({ where: params });
    return mediaItems.map(item => item.toJSON());
  }

};
