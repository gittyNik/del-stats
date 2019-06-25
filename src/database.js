import Sequelize from 'sequelize';
import dbConfig from '../db/config/config';

export default new Sequelize(dbConfig.default);
