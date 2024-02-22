import { json } from "@sveltejs/kit";
import { mysqlconnFn } from "$lib/db/mysql.js";

export async function POST({ request }) {
  const { st } = await request.json();
  let mysqlconn = await mysqlconnFn();
  let results = await mysqlconn
    .query("SELECT * FROM canais where id = '" + st + "'")
    .then(function ([rows, fields]) {
      //     console.log("Got this far!!");
      //     console.log(rows);
      return rows;
    });

  return json(results);
}