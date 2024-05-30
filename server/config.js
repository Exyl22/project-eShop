require("dotenv").config();
const mysql = require("mysql2");

const urlDB = `mysql://root:nzqHCdnxzETDuwPMjqxJrXMxiVxuEfRj@viaduct.proxy.rlwy.net:17583/railway`
const connection = mysql.createConnection();

module.exports = connection;