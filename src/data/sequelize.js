import Sequelize from 'sequelize';
import fixtures from 'sequelize-fixtures';
import { APP_ENV, DB_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from '../config';
import { Pool } from 'pg';

const dbUrl = DB_URL ||
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;


const pool = new Pool({
  max: 10,
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  native: APP_ENV === 'stage',
  logging: false,
  define: {
    freezeTableName: true
  }
});

const createTransport = (slug) => {
  return {
    model: 'TransportType',
    data: { slug }
  };
};

export const loadFixtures = () => {

	const models = require('./models');
	const data = [
	  createTransport('bus'),
	  createTransport('train'),
	  createTransport('car'),
	  createTransport('taxi'),
	  createTransport('hitch-hike'),
	  createTransport('van'),
	  createTransport('shared-taxi'),
	  createTransport('bike'),
	  createTransport('walk'),
	  createTransport('run'),
    createTransport('ski'),
	  createTransport('swim'),
	  createTransport('boat'),
	  createTransport('plane'),
	  createTransport('helicopter')
  ];

	console.log(models);
	fixtures.loadFixtures(data, models).then((...args) => {
			console.log(args);
	});

};

export default sequelize;
