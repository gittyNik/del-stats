import browser_history_items from '../models/browser_history_items';
import browser_visit_items from '../models/browser_visit_items';
import ip from 'ip';

export const getAllBrowserHistoryItems = (req, res) => {
  browser_history_items.findAll({})
    .then((data) => { res.json(data); })
    .catch((err) => {});
};

export const getAllBrowserVisitItems = (req, res) => {
  browser_visit_items.findAll({})
    .then((data) => { res.json(data); })
    .catch((err) => {});
};

export const getAllDataByUrlId = (req, res) => {
  browser_history_items.findAll({
    where: {
      browser_url_id: req.params.url_id,
    },
  })
    .then(async (data) => {
      const promise = browser_visit_items.findAll({ attributes: ['user_id', 'browser_url_id', 'visited_timestamp', 'visit_id', 'ip', 'transition'] }, {
        where: {
          browser_url_id: data[0].browser_url_id,
        },
      });
      const k = await promise;
      promise.then((data1) => {
        const datavalue = JSON.parse(JSON.stringify(data[0]));
        datavalue.visit = data1;
        res.json(datavalue);
      });
    })
    .catch(err => res.status(500).send(err));
};

export const getAllDataByUserId = (req, res) => {
  browser_visit_items.findAll({
    where: {
      user_id: req.params.user_id,
    },
  })
    .then((data3) => {
      const arr = [];
      for (let i = 0; i < data3.length; i++) {
        arr.push(data3[i].browser_url_id);
      }
      browser_history_items.findAll({
        where: {
          browser_url_id: arr,
        },
      })
        .then((data) => {
          const datavalue = JSON.parse(JSON.stringify(data));
          for (let j = 0; j < data.length; j++) {
            datavalue[j].visit = data3;
          }
          res.json(datavalue);
        })
        .catch(err => res.status(500).send(err));
    });
};

export const insertHistory = (req, res) => {
  const historyitem = req.body.historyitem;
  for (var i = 0; i < historyitem.length; i++) {
    (function (i, historyitem) {
      browser_history_items.create({
        browser_url_id: historyitem[i].id,
        url: historyitem[i].url,
        title: historyitem[i].title,
        useragent: historyitem[i].userAgent,
      }).catch((err) => {});
    }(i, historyitem));
  }
  for (var i = 0; i < historyitem.length; i++) {
    for (let j = 0; j < historyitem[i].visit.length; j++) {
      (function (j, historyitem) {
        browser_visit_items.create({
          browser_url_id: historyitem[i].visit[j].id,
          ip: ip.address(),
          user_id: req.body.getid,
          visited_timestamp: historyitem[i].visit[j].visitTime,
          visit_id: historyitem[i].visit[j].visitId,
          transition: historyitem[i].visit[j].transition,
        }).catch((err) => {});
      }(j, historyitem));
    }
  }
};
