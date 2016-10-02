import Sequelize from 'sequelize';
import { DB_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from '../config';

const dbUrl = DB_URL ||
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  
const sequelize = new Sequelize(dbUrl, {
  define: {
    freezeTableName: true,
  }
});

export default sequelize;
