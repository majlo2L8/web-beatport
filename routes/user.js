//==========================================================================
// contain all of my user related routes
const mysql = require('mysql');
const connection = require('./../config.js');
//const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const bodyParser   = require('body-parser');

//==========================================================================
// users ROUTE
module.exports = function(app,passport) {

    // use isLoggedIn function
    app.get('/', isLoggedIn,function(req,res){
        var row = [];
        var row2 = [];
        var isLoggedQuery = 'SELECT * FROM users WHERE id = ?';

        console.log(req.user.id);
        connection.query(isLoggedQuery, [req.user.id], function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {
                        row[i] = rows[i];
                    }
                }
                console.log(row);
            }
            //res.redirect('/preferences');
            //console.log(user.id);
            res.render('preferences.ejs');
        });
    });

    // REGISTRATION ============================================================
    app.get('/signup', function(req, res){
      req.logout();
        res.render('signup.ejs',{ message: req.flash('message') });
    });

    // LOGIN ===================================================================
    app.get('/login', function(req, res) {
        res.render('login.ejs',{ message: req.flash('loginMessage') });
    });


    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/login',
            failureRedirect: '/signup',
            failureFlash : true,
            session: false
    }));

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/preferences',
            failureRedirect : '/login',
            failureFlash : true,
            session: true
        }),

        function(req, res) {
            console.log("hello");
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });


    // LOGOUT ==================================================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};

//==========================================================================
// define functions
function isLoggedIn(req, res, next){
	if (req.isAuthenticated()) {
  //  res.render('preferences.ejs')
		return next();
  }
	res.redirect('/login');
}











/*

// TMP
router.get("/users", (req, res) => {
  var queryString = "SELECT * FROM users"
  connection.query(queryString, (err, rows, fields) => {
    if (err) {
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
      return
    }
    res.json(rows)
  })
})

// POST method /create_user
router.post('/user_create', (req, res) => {
  console.log("Trying to create new user...")
  var userName = req.body.create_username
  var hash = req.body.create_password
  // insert query
  var insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)'
  // insert function
  connection.query(insertQuery, [userName, hash], (err, results, fields) => {
    if (err) {
      console.log("Failed to insert new user: " + err)
      res.sednStatus(500)
      return
    }
    console.log("Inserted a new user with id: ", results.insertId);
    res.end()
  })

  res.end()
})

// get user method
router.get('/user/:id', function (req, res) {
  console.log(" Fetching user with id: " + req.params.id)
  var userId = req.params.id
  // select username query
  var selectQuery = 'SELECT username FROM users WHERE id = ?'
  // select function
  connection.query(selectQuery, [userId], function (err, results, fields) {
    if (err) {
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
      return
      // throw err
    }
    console.log("I think it's fetched successfully")
    var users = rows.map((row) => {
      return {username: row.username}
    })

    res.json(users)
    // res.end()
  })
})




module.exports = router */
