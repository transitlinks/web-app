import sequelize from '../sequelize';
import User from './User';
import Locality from './Locality';
import TransitLink from './TransitLink';
import LinkInstance from './LinkInstance';
import TransportType from './TransportType';

TransitLink.belongsTo(Locality, {
  foreignKey: 'fromId',
  as: 'from'
});

TransitLink.belongsTo(Locality, {
  foreignKey: 'toId',
  as: 'to'
});

LinkInstance.belongsTo(TransitLink, {
  foreignKey: 'linkId',
  as: 'link'
});

LinkInstance.belongsTo(TransportType, {
  foreignKey: 'transportId',
  as: 'transport'
});

function sync(...args) {
  return sequelize.sync(...args);
}

export default { sync };
export { User, Locality, TransitLink, LinkInstance, TransportType };
