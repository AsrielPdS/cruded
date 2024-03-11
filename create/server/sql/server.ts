import express from "express";
import { knex } from 'knex';

const conn = knex({
  client: 'sqlite3',
  connection: {
    filename: './data.db',
  },
});
const app = express()
  .use(express.json() as any);

function table(table: string, id = "id") {
  app.route(`/${table}`)
    .get((req) => {
      req.body
      conn(table).select();
    })
    .post(async req => {
      let ids = await conn(table).insert(req.body);

      return ids.map(i => ({ [id]: i }));
    })
    .put(req => {
      return Promise.all((req.body as any[])
        .map(item =>
          conn(table)
            .where(id, '=', item[id])
            .update(item)));
    })
    .delete(req => {
      return Promise.all((req.body as any[])
        .map(id => conn(table).where(id, '=', id).del()))
    });
}

table("costumer");
table("country");


app.listen(3000)