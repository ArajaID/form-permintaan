import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "mysql://root:ditasayang@127.0.0.1:3306/form_permintaan";


export const pool = mysql.createPool(connectionString);

export const db = drizzle(pool, { schema, mode: "planetscale" });


