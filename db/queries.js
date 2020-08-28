const Pool = require("pg").Pool;
const pool = new Pool({
  user: "sean",
  host: "localhost",
  database: "chimp_db",
  password: "123",
  port: 5432,
});
