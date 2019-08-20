import Sequelize from 'sequelize';
import dbConfig from '../db/common/config';

export default new Sequelize(dbConfig.default);
