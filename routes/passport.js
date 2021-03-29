//==========================================================================

const LocalStrategy   = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const connection = require('./../config.js');
const selectQuery = "SELECT * FROM users WHERE username = ?";
//const session  = require('express-session');
//const flash    = require('connect-flash');


//==========================================================================
//
module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
      console.log("serialize complete");
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {

        connection.query(selectQuery, user, function (err, rows) {  // connection.query(selectQuery, [id], function(err, rows){  //user
            if (err) {
              return(err);
            } else {
              console.log("Deserialize complete");
              console.log(user);
            }
            done(null, user);                 //   done(err, rows[0]);
        });
    });

// SIGNUP ==================================================================
    passport.use(
        'local-signup',
        new LocalStrategy({

            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {

            connection.query(selectQuery, [username], function(err, rows) {
                if (err) {
                    return done(err);
                }
                if (rows.length >0) {
                    return done(null, false, req.flash('message', 'That username is already taken.'));
                    req.flash('message', 'That username is already taken.');
                } else {
                    // define values for new user
                    var today = new Date();
                    var salt = bcrypt.genSaltSync(10);
                    var hash = bcrypt.hashSync(password, salt);
                    // generate newUserMysql obejct
                    var newUserMysql = {
                        "username": username,
                        "password": hash,
                        "created_at": today,
                        "updated_at": today
                    }
                    // insert query
                    var insertQuery = "INSERT INTO users SET ?";

                    connection.query(insertQuery, newUserMysql, function (err, rows) {
//                      if (!err) {
                        newUserMysql.id = rows.insertId;
                        console.log(newUserMysql.id);
                        console.log(" successfully created.");


                        var emptyQuery = "INSERT INTO releases(user_id, search_result) VALUES(?, ?)";
                        connection.query(emptyQuery, [newUserMysql.id, " "], function (err, rows) {


                        return done(null, newUserMysql.id); // newUserMysql
                      });
                    });
                }
            });
        })
    );

// LOGIN ===================================================================
    passport.use(
        'local-login',
        new LocalStrategy({

            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            connection.query(selectQuery, [username], function(err, rows){
                if (err) {
                    return done(err);
                }
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'Wrong username'));
                }

                if (!bcrypt.compareSync(password, rows[0].password)) {
                    return done(null, false, req.flash('loginMessage', 'Wrong password'));
                }
                console.log(username);
                console.log(rows);
                return done(req.user, rows[0].id);

            });
        })
    );
};
