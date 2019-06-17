import TepTopic from '../../models/topic';
import sequelize  from 'sequelize';
import uuid from 'uuid/v4';

export const create = (req, res)=> {
  let {title, description} = req.body;
  const topic = TepTopic.init(sequelize);
  topic.create({
    id: uuid(),
    program: 'tep',
    title,
    description,
  })
  .then(tepTopic => {
    res.send({
      data: tepTopic
    });
  })
  .catch(err=>console.log(err));
}
