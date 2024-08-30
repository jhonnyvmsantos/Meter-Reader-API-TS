import { Part } from "@google/generative-ai";
import db from "../database/connect";
import { model } from "..";
import { UploadMeterToAnalysis } from "../controllers/measure.controller";

async function meterAnalysis(base64: string[], meter: string): Promise<string> {
  const prompt: string = `Analysis the meter of a ${meter} and bring me the measured value, just the value`;

  const data: Part = {
    inlineData: {
      data: base64[1],
      mimeType: base64[0],
    },
  };

  const result = await model.generateContent([prompt, data]);
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
    data.measure_type,
    data.measure_datetime,
    value,
    url,
  ];

  const conn = await db.connect();
  const [rows] = await conn.query(sql, record);
  console.log(rows);

  conn.end();
}

async function meterMonthValidate(
  month: number,
  costumer_code: string
): Promise<boolean> {
  const sql: string =
    "SELECT COUNT(a.measure_uuid) AS count FROM tbl_measure AS a INNER JOIN tbl_costumer AS b ON b.costumer_code = a.costumer_code WHERE MONTH(a.measure_datetime) = ? AND a.costumer_code = ?;";

  const data: (string | number)[] = [month, costumer_code];
  const conn = await db.connect();
  const [rows] = await conn.query(sql, data);
  conn.end();
  return JSON.stringify(rows).includes("0");
}

async function measureCodeConfirm(uuid: string): Promise<boolean> {
  const sql: string =
    "SELECT COUNT(a.measure_uuid) AS count FROM tbl_measure AS a WHERE a.measure_uuid = ?;";

  const conn = await db.connect();
  const [rows] = await conn.query(sql, uuid);
  conn.end();
  return JSON.stringify(rows).includes("1");
}

async function hasMeasureConfirmed(uuid: string): Promise<boolean> {
  const sql: string =
    "SELECT a.has_confirmed FROM tbl_measure AS a WHERE a.measure_uuid = ?;";

  const conn = await db.connect();
  const [rows] = await conn.query(sql, uuid);
  conn.end();
  return !JSON.stringify(rows).includes("1");
}

async function updateHasConfirmedValue(uuid: string): Promise<void> {
  const sql: string =
    "UPDATE tbl_measure SET has_confirmed = 1 WHERE measure_uuid = ?;";

  const conn = await db.connect();
  const [rows] = await conn.query(sql, uuid);
  conn.end();
}

export default {
  meterAnalysis,
  createMeasurementRecord,
  meterMonthValidate,
  measureCodeConfirm,
  hasMeasureConfirmed,
  updateHasConfirmedValue,
};
