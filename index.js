const { exec } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');

const port = 9980;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const key = 1234;

function authenticationError(res) {
  res.send({
    status: 'error',
    msg: 'Authentication error.'
  });
  return null;
}

/**
 * shutdown - Shuts down server. Proper key must be provided in post body.
 *
 * @returns {JSON} Returns an object with the status of the operation in the form:
 *  {
 *     status: error, success, or info
 *     msg: A message describing the current state.
 *  }
 */
app.post('/shutdown', (req, res) => {
  if (!req.body || req.body.key !== key) return authenticationError(res);
  exec('shutdown +1', (err) => {
    const returnObj = {};
    if (err) {
      returnObj.status = 'error';
      returnObj.msg = 'Schedule shutdown unsuccessful.';
    } else {
      returnObj.status = 'info';
      returnObj.msg = 'Shutdown scheduled one minute from now.';
    }
    res.send(returnObj);
  });
});

/**
 * restart - Restarts server. Proper key must be provided in post body.
 *
 * @returns {JSON} Returns an object with the status of the operation in the form:
 *  {
 *     status: error, success, or info
 *     msg: A message describing the current state.
 *  }
 */
app.post('/restart', (req, res) => {
  if (!req.body || req.body.key !== key) return authenticationError(res);
  exec('shutdown -r +1', (err) => {
    const returnObj = {};
    if (err) {
      returnObj.status = 'error';
      returnObj.msg = 'Schedule reboot unsuccessful.';
    } else {
      returnObj.status = 'info';
      returnObj.msg = 'Reboot scheduled one minute from now.';
    }
    res.send(returnObj);
  })
})

app.listen(port);
