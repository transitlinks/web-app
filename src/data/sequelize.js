import Sequelize from 'sequelize';
import fixtures from 'sequelize-fixtures';
import { DB_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from '../config';

const dbUrl = DB_URL ||
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  
const sequelize = new Sequelize(dbUrl, {
  define: {
    freezeTableName: true,
  }
});

export const loadFixtures = () => {

	const models = require('./models');
	const data = [
		{
			model: 'TransportType',
			data: {
				slug: 'bus'
			}
		},
		{
			model: 'TransportType',
			data: {
				slug: 'train'
			}
		}
	];
	
	console.log(models);	
	fixtures.loadFixtures(data, models).then((...args) => {
			console.log(args);
	});

};

export default sequelize;
