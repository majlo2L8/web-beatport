//==========================================================================
// mysql module and connection
const mysql = require('mysql');
const connection = require('./../config.js');
const bodyParser   = require('body-parser');
const exec = require('exec');

//==========================================================================
// TO DO: - ejs page
//        -
//==========================================================================
// MYSQL:
//     reg1.users     >  id | username | password | created_at | updated_at
//     reg1.pref      >  pref_id | user_id | artist
//     reg1.releases  >  id | user_id | search_result | date

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
            var rowResult = '<br/>' + row.artist;
            console.log(rowResult);
            return req.flash('titles', rowResult);  // return req.flash('titles', row.artist.replace('\n', '<br>'));
          });
          var message = "";
          res.render('preferences.ejs',{ message: req.flash('message'), titles: req.flash('titles') });
        });

    }

    // gET releases FROM db ====================================================================
    function show_releases(req, res) {

        var userRelQuery = "SELECT search_result FROM reg1.releases WHERE user_id = ? ORDER BY id DESC";
        connection.query(userRelQuery, [req.user], function(err, rows, fields) {
          if (err) throw err;
          var row = "";
          Object.keys(rows).forEach(function(key) {
            var row = rows[key];
            var rowResult = row.search_result;
            //console.log(rowResult);
            return req.flash('releases', rowResult);  // return req.flash('titles', row.artist.replace('\n', '<br>'));
          });
          res.render('releases.ejs',{ message: req.flash('message'), releases: req.flash('releases') });
        });

    }

    // gET PREF FROM db ====================================================================
    function show_link_pref(req, res) {

        var userPrefQuery = "SELECT artist FROM reg1.pref WHERE user_id = ? ORDER BY artist";
        connection.query(userPrefQuery, [req.user], function(err, rows, fields) {
          if (err) throw err;
          var row = "";
          Object.keys(rows).forEach(function(key) {
            var row = rows[key];
            var rowResult = '<br/>' + '<button type="submit" class="btn btn-danger" name="remove_pref_artist" value="' + row.artist + '">' + row.artist + '</button>';   //    ' + row.artist + '
            //console.log(rowResult);
            return req.flash('titles', rowResult);  // return req.flash('titles', row.artist.replace('\n', '<br>'));
          });
          res.delimiter = ' ';
          res.render('remove_preferences.ejs',{ message: req.flash('message'), titles: req.flash('titles') });
        });

    }

    //==========================================================================
    app.get('/preferences', function(req, res) {
        show_pref(req, res);
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

      //==========================================================================
      app.get('/remove_preferences', function(req, res) {
          show_link_pref(req, res);
      });

      // remove preferences
      app.post('/remove_preferences', function(req, res) {
          var removePrefQuery = "DELETE FROM reg1.pref WHERE user_id = ? AND artist = ?";
          var removePrefArtist = req.body.remove_pref_artist;
          var userId = req.user;
          connection.query(removePrefQuery, [userId, removePrefArtist], function (err, rows) {
            if (err) {
              throw err
            }
            console.log(removePrefArtist);
            res.redirect('/remove_preferences');
          });
      });

      //==========================================================================
      app.get('/releases', function(req, res) {
          show_releases(req, res);
      });

      app.post('/releases', function(req, res) {

          exec('/home/majlo/Documents/Script/musicautomation/web_beatport-v4.sh ' + req.user, function (err, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (err) {
              console.log('exec error: ' + err);
            }
            var userId = req.user;
            var newReleases = stdout
            var today = new Date();
            var newRelease = {
              "user_id": userId,
              "search_result": newReleases,
              "search_date": today
            }
            var insertReleasesQuery = "INSERT INTO releases SET ?";

            var findReleasesQuery = "SELECT search_result FROM releases WHERE user_id = ? ORDER BY id DESC LIMIT 1";
            connection.query(findReleasesQuery, [userId], function(err, rows) {
              if (err) {
                console.log(err);
              }

              Object.keys(rows).forEach(function(key) {
              var row = rows[key];
              var rowResult = row.search_result
                console.log("New:", newReleases);
                console.log("actual:", rowResult);

                if (rowResult) {
                  if (rowResult !== newReleases) {
                    connection.query(insertReleasesQuery, newRelease, function (err, rows) {
                      if (err) {
                        console.log(err);
                      }
                      console.log("inserted OK:", rows);
                      res.redirect('/releases');
                    });
                  } else {
                    console.log('Nothing new.');
                    req.flash('message', 'Nothing new.');
                    res.redirect('/releases');
                  };
                } else {
                  connection.query(insertReleasesQuery, newRelease, function (err, rows) {
                    if (err) {
                      console.log(err);
                    }
                    console.log("inserted OK:", rows);
                    res.redirect('/releases');
                  });
                }
              });
            });

          });
      });


};
