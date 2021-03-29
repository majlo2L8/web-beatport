//==========================================================================
// load nodejs modules and stuff
const express   = require('express');
const app       = express();
const morgan    = require('morgan');
const mysql     = require('mysql');
const port      = 3003;
const session   = require('express-session');
const flash     = require('connect-flash');
const passport  = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const connection   = require('./config.js'); // call connection from config.js
const exec = require('exec');

// call passport route
require('./routes/passport.js')(passport);

// modules =====================================================================
// get modules
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/views')); //app.use(express.static(__dirname + '/views'));  ./public
app.use(morgan('dev')); // 'DEV' to log every request to the console || 'short'
app.use(cookieParser()); // read cookies (needed for auth)
app.set('view engine', 'ejs'); // set up ejs for templating
// required for passport
app.use(session({
    secret: 'heymortydropthatbeat',
    resave: true,
    saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// for showing user info
//app.use(function(req, res, next){
//  res.locals.user = req.user;
//  next();
//});

// routes ======================================================================
// call user routes
require('./routes/user.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./routes/preferences.js')(app);

// launch ======================================================================
// localhost: 3003
app.listen(port, () => {
  console.log('heymortydropthatbeat localhost: ' + port);
})
