const { exec } = requre('child_process');
const express = require('express');
const bodyParser = require('body-parser');

const port = 9980;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const key = 1234;

app.post('/', (req, res) => {
  if (!req.body) res.send({
    status: 'error',
    msg: 'Authentication error.'
  });
  if (req.key === key) {
    exec('shutdown +1', (err) => {
      const returnObj = {};
      if (err) {
        returnObj.status = 'error';
        returnObj.msg = 'Schedule shutdown unsuccessful.';
      } else {
        returnObj.status = 'success';
        returnObj.msg = 'Shutdown schedules one minute from now.';
      }
      res.send(returnObj);
    });
  }
});

app.listen(port);
