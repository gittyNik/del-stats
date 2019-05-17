state = require('../index');
if (state.status == 'S') {
    var Links = sequelize.define('links', {
        id: {
            type: Sequelize.INTEGER
        },
        topic: {
            type: Sequelize.STRING
        },
        url: {
            type: Sequelize.STRING
        }
    }, {
        freezeTableName: true
    });
    export default Links;
}
/*import mongoose from 'mongoose';
const {Schema} = mongoose;

const Link = mongoose.model('Link', new Schema({
  data:Schema.Types.Mixed,
  url: String
}));

export default Link;
*/