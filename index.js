#! /usr/bin/env node

const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

const port = 9070;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function authenticationError(res, customMessage) {
  res.send({
    status: 'error',
    msg: customMessage || 'Invalid username or password.',
  });
  return null;
}

/**
 * findUser - Find a user in the database.
 *
 * @param {String} username The user's username.
 * @param {Database} db     The database to query against.
 *
 * @returns {type} Description
 */
function findUser(username, callback) {
  const db = new sqlite3.Database(
    path.join(__dirname, 'hc-info.db'),
    sqlite3.OPEN_READONLY,
  );

  const queryString = 'SELECT * FROM users WHERE USERNAME=$val;';
  db.serialize(() => {
    const stmt = db.prepare(queryString);
    stmt.get([username], (err, row) => {
      if (err || !row) {
        callback(Error('Unable to find user.'));
      } else {
        callback(null, row);
      }
    });
  });
}

/**
 * checkPassword - Checks given password against hashed copy from db.
 *
 * @param {String} plainText The user's password
 *
 * @returns {Boolean} True if password is valid, else false.
 */
function checkPassword(user, plainText, callback) {
  bcrypt.compare(String(plainText), user.PASSWORD, (err, res) => {
    if (err) {
      console.error(err);
      return callback(Error('An error occured checking password'));
    }
    return callback(null, res);
  });
}

function authenticateUser(username, password, callback) {
  findUser(username, (usrErr, user) => {
    if (usrErr) console.log(usrErr);
    if (usrErr) return callback(usrErr);
    checkPassword(user, password, (pwErr, isCorrect) => {
      if (pwErr) console.log(pwErr);
      if (pwErr) return callback(pwErr);
      return callback(null, isCorrect);
    });
    return null;
  });
}

/**
  * Authentication Middleware - Authenticates the user. If they don't send the
  *   correct username or password they will not be able to access anything.
  */
app.all('*', (req, res, next) => {
  if (!req.body || !req.body.username || !req.body.password) return authenticationError(res);
  authenticateUser(req.body.username, req.body.password, (err, isAuthed) => {
    if (isAuthed) return next();
    let msg = null;
    if (!err) {
      msg = 'Invalid username or password.';
    }
    return authenticationError(res, msg);
  });
  return null;
});


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
  if (!req.body || !req.body.username || !req.body.password) return authenticationError(res);
  exec('shutdown +1', (err) => {
    const returnObj = {};
    if (err) {
      console.log(err);
      returnObj.status = 'error';
      returnObj.msg = 'Schedule shutdown unsuccessful.';
    } else {
      returnObj.status = 'info';
      returnObj.msg = 'Shutdown scheduled one minute from now.';
    }
    res.send(returnObj);
  });
  return null;
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
  });
  return null;
});

app.listen(port, () => console.log('Listening on port: ', port));
