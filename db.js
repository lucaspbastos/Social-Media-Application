require("dotenv").config();

// This makes sure you can read your .env file
const host = process.env.MYSQL_HOST;
const database = process.env.MYSQL_DB;

console.log(`connecting to database ${database} on ${host}`);