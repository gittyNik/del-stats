import TepTopic from '../../models/topic';
import uuid from 'uuid/v4';

export const create = (req, res)=> {
  let {title, description} = req.body;
  TepTopic.create({
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
