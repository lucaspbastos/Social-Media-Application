require("dotenv").config();
var mariadb = require('mariadb');

// Prepare to connect to MySQL with your secret environment variables
var pool = mariadb.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "CS490",
    database: "CS490",
    
});

// Expose a method to establish connection with MariaDB SkySQL
module.exports={
  getConnection: function(){
    return new Promise(function(resolve,reject){
      pool.getConnection().then(function(connection){
        resolve(connection);
      }).catch(function(error){
        reject(error);
      });
    });
  }
}