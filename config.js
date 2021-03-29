// =============================================================================
// Define mysql connection to work with database.
const mysql = require('mysql');
// module.exports = connection;
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'majlo',
  password : 'tmp-Passw0rd2580',
  database : 'reg1'
});

// connect to database
connection.connect(function(err){
  if(!err) {
      console.log("Database is connected");
  } else {
      console.log("Error while connecting with database");
  }
});

module.exports = connection;
