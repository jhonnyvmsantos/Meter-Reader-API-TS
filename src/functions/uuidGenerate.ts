import { v4 as uuidv4 } from "uuid";
import db from "../database/connect";

async function generateUniqueUUID(
  tableName: string,
  columnName: string
): Promise<string> {
  let isUnique = false;
  let newUUID: string = "";

  const sql: string = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${columnName} = ?`;
  const conn = await db.connect();

  while (!isUnique) {
    newUUID = uuidv4();
    const [rows] = await conn.query(sql, newUUID);

    if ((rows as any)[0].count === 0) {
      isUnique = true;
    }
  }

  return newUUID;
}

export { generateUniqueUUID };
