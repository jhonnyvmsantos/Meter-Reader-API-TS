import mysql2 from "mysql2/promise";

async function connect() {
  return await mysql2.createConnection({
    host: "mysqldb",
    port: 3306,
    password: "root",
    database: "db_meter",
    user: "root",
  });
}

export default { connect };
