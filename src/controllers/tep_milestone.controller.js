import TepMilestone from '../../models/milestone';
import uuid from 'uuid/v4';

export const create = (req, res)=> {
  let {name, topics} = req.body;
  TepMilestone.create({
    id: uuid(),
    name,
    topics
  })
  .then(tepMilestone => {
    res.send({
      data: tepMilestone
    });
  })
  .catch(err=>console.log(err));
}
