const mysql = require("mysql2");

const sql_pool = mysql.createPool({
  host: process.env.AWS_DB_HOST,
  user: process.env.AWS_DB_USERNAME,
  password: process.env.AWS_DB_PASSWORD,
  database: process.env.AWS_DB_NAME,
  port: process.env.AWS_DB_PORT,
});

module.exports = sql_pool.promise();
