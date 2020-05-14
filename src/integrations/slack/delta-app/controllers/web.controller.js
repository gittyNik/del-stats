import { composeCatalystBreakoutMessage } from "../views/breakout.view";
import web from "../client";
import { User } from "../../../../models/user";
import { Cohort } from "../../../../models/cohort";
import { CohortBreakout } from "../../../../models/cohort_breakout";

export const sendMessage = (req, res) => {
  const { userId, cohortId, breakoutId, topics } = req.body;
  Promise.all([
    User.findByPk(userId),
    Cohort.findByPk(cohortId),
    CohortBreakout.findByPk(breakoutId),
  ])
    .then(([user, cohort, breakout]) =>
      composeCatalystBreakoutMessage(user, cohort, breakout, topics)
    )
    .then(web.chat.postMessage)
    .then(() => {
      res.status(200).json({
        text: `Message sent to breakouts channel`,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};
