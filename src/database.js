import Sequelize from 'sequelize';
import dbConfig from '../db/common/config';

const database = new Sequelize(dbConfig.default);

export default database;
