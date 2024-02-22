import mysql from "mysql2/promise";

let mysqlconn = <any>null;

export function mysqlconnFn() {
  if (!mysqlconn) {
    // used for development with MAMP
    // mysqlconn = mysql.createConnection({
    //   host: "127.0.0.1",
    //   user: "root",
    //   password: "",
    //   database: "statedata",
    // });
    mysqlconn = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "tv",
    });
  }

  return mysqlconn;
}