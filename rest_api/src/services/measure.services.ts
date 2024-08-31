import { Part } from "@google/generative-ai";
import db from "../database/connect";
import { model } from "..";
import { UploadMeterToAnalysis } from "../controllers/measure.controller";

async function createDBEstructure(): Promise<void> {
  let sql: string =
    "CREATE TABLE IF NOT EXISTS tbl_measure (measure_uuid VARCHAR(100) PRIMARY KEY, image LONGBLOB, costumer_code VARCHAR(100), measure_datetime DATETIME DEFAULT NOW(), measure_type VARCHAR(5), measure_value INT, has_confirmed BOOLEAN DEFAULT FALSE, image_url VARCHAR(2083));";

  const conn = await db.connect();
  await conn.query(sql);
  conn.end();
  console.log("Estrutura do Banco de Dados preparada.");
}

setTimeout(() => {
  createDBEstructure();
}, 30000);

async function meterAnalysis(base64: string[], meter: string): Promise<string> {
  const prompt: string = `Analyze the ${meter.toLowerCase()} meter and bring me the measured value, only the value.`;

  const data: Part = {
    inlineData: {
      data: base64[1],
      mimeType: base64[0],
    },
  };

  const result = await model.generateContent([prompt, data]);
  console.log(result.response.text());
  return result.response.text();
}

async function createMeasurementRecord(
  uuid: string,
  data: UploadMeterToAnalysis,
  value: number,
  url: string
): Promise<void> {
  const sql: string =
    "INSERT INTO tbl_measure (measure_uuid, image, costumer_code, measure_type, measure_datetime, measure_value, image_url) VALUE (?, ?, ?, ?, ?, ?, ?);";

  const record: (string | number)[] = [
    uuid,
    data.image,
    data.customer_code,
    data.measure_type.toUpperCase(),
    data.measure_datetime,
    value,
    url,
  ];

  const conn = await db.connect();
  await conn.query(sql, record);
  conn.end();
}

async function meterMonthValidate(
  month: number,
  costumer_code: string,
  measure_type: string
): Promise<boolean> {
  const sql: string =
    "SELECT COUNT(a.measure_uuid) AS count FROM tbl_measure AS a WHERE MONTH(a.measure_datetime) = ? AND a.measure_type = ? AND a.costumer_code = ?;";

  const data: (string | number)[] = [
    month,
    measure_type.toUpperCase(),
    costumer_code,
  ];
  const conn = await db.connect();
  const [rows] = await conn.query(sql, data);
  console.log(rows);
  conn.end();
  return JSON.stringify(rows).includes("0");
}

async function measureCodeConfirm(uuid: string): Promise<boolean> {
  const sql: string =
    "SELECT COUNT(a.measure_uuid) AS count FROM tbl_measure AS a WHERE a.measure_uuid = ?;";

  const conn = await db.connect();
  const [rows] = await conn.query(sql, uuid);
  console.log(rows);
  conn.end();
  return JSON.stringify(rows).includes("1");
}

async function hasMeasureConfirmed(uuid: string): Promise<boolean> {
  const sql: string =
    "SELECT a.has_confirmed FROM tbl_measure AS a WHERE a.measure_uuid = ?;";

  const conn = await db.connect();
  const [rows] = await conn.query(sql, uuid);
  console.log(rows);
  conn.end();
  return !JSON.stringify(rows).includes("1");
}

async function updateConfirmedValue(
  value: number,
  uuid: string
): Promise<void> {
  const sql: string =
    "UPDATE tbl_measure SET has_confirmed = 1, measure_value = ? WHERE measure_uuid = ?;";

  const data: (string | number)[] = [value, uuid];
  const conn = await db.connect();
  await conn.query(sql, data);
  conn.end();
}

async function getAllMeasuresCostumer(uuid: string, type: string | undefined) {
  let sql: string =
    "SELECT a.measure_uuid, a.measure_datetime, a.measure_type, a.has_confirmed, a.image_url FROM tbl_measure AS a WHERE a.has_confirmed = 1 AND a.costumer_code = ?";

  let data: string | string[] = uuid;

  if (type !== undefined) {
    data = [uuid, type.toUpperCase()];
    sql += " AND a.measure_type = ?";
  }

  const conn = await db.connect();
  const [rows] = await conn.query(sql, data);
  console.log(rows);
  conn.end();
  return rows;
}

export default {
  meterAnalysis,
  createMeasurementRecord,
  meterMonthValidate,
  measureCodeConfirm,
  hasMeasureConfirmed,
  updateConfirmedValue,
  getAllMeasuresCostumer,
};
