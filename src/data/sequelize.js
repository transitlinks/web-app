import { DB_URL } from '../config';
import Sequelize from 'sequelize';

const sequelize = new Sequelize(DB_URL, {
  define: {
    freezeTableName: true,
  }
});

export default sequelize;
