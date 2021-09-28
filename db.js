//require("dotenv").config();

// This makes sure you can read your .env file
//const host = process.env.MYSQL_HOST;
//const database = process.env.MYSQL_DB;

//console.log(`connecting to database ${database} on ${host}`);

require("dotenv").config();
var mariadb = require('mariadb');

// Prepare to connect to MySQL with your secret environment variables
var pool = mariadb.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
});


 
// Expose a method to establish connection with MariaDB SkySQL
module.exports = Object.freeze({
  pool: pool
});