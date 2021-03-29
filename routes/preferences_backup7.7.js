//==========================================================================
// mysql module and connection
const mysql = require('mysql');
const connection = require('./../config.js');
const bodyParser   = require('body-parser');

//==========================================================================
// TO DO: - ejs page
//        -
//        -
//        -
//==========================================================================
// MYSQL = reg1.pref  >  pref_id | user_id | artist
//==========================================================================
// ROUTE

// users ROUTE
module.exports = function(app) {

    // gET PREF FROM db ====================================================================
    function show_pref(req, res) {

        var userPrefQuery = "SELECT artist FROM reg1.pref WHERE user_id = ? ORDER BY artist";

        connection.query(userPrefQuery, [req.user], function(err, rows, fields) {

          if (err) throw err;
          var row = "";
          Object.keys(rows).forEach(function(key) {
            var row = rows[key];
            //  '<br/>' + '<a href="#" class="alert-link">' + row.artist + '</a>';
            var rowResult = '<br/>' + row.artist;
            console.log(rowResult);
            return req.flash('titles', rowResult);  // return req.flash('titles', row.artist.replace('\n', '<br>'));
          });
          res.delimiter = ' ';
          res.render('preferences.ejs',{ message: req.flash('message'), titles: req.flash('titles') });
        });

    }

    //==========================================================================
    app.get('/preferences', function(req, res) {

        show_pref(req, res);
        //var titles = show_pref(req, res);
        //console.log(titles);
        //res.render('preferences.ejs',{ message: req.flash('message'), titles: req.flash('titles') });
    });

    // add preferences
    app.post('/preferences', function(req, res) {

        var findPrefQuery = "SELECT artist FROM reg1.pref WHERE user_id = ? AND artist = ?";
        var addPrefArtist = req.body.add_pref_artist;
        var userId = req.user;

        connection.query(findPrefQuery, [userId, addPrefArtist], function(err, rows) {
          console.log(rows);

          if (err) {
              console.log(err);
              throw err
          }
          if (rows.length >0) {
              console.log('That artist is already loaded.');
              req.flash('message', 'That artist is already loaded.');
              res.redirect('/preferences');
          } else {
            // insert line
            var newPrefArtist = {
              "user_id": userId,
              "artist": addPrefArtist
            }
            // insert query
            var insertPrefQuery = "INSERT INTO pref SET ?";

            connection.query(insertPrefQuery, newPrefArtist, function (err, rows) {
              if (err) {
                console.log(err);
              }
              console.log("inserted OK:", insertPrefQuery, newPrefArtist, rows);
              res.redirect('/preferences');
            });
          }
        });
      });

};
