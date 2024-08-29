import { base64FormatValidation, ResBase64 } from "../functions/base64Format";
import { Router, Response, Request } from "express";
import services from "../services/measure.services";
import { generateUniqueUUID } from "../functions/uuidGenerate";
import { convertBase64ToTempUrl } from "../functions/tempManager";

const router = Router();

export interface UploadMeterToAnalysis {
  image: string;
  customer_code: string;
  measure_datetime: string;
  measure_type: string;
}

export interface ResponseMeterAnalysis {
  image_url: string;
  measure_value: number;
  measure_uuid: string;
}

router.post("/upload", async (req: Request, res: Response) => {
  let data: UploadMeterToAnalysis;
  let format: ResBase64 | undefined;

  // DATA VALIDATE

  try {
    data = req.body;
    format = base64FormatValidation(data.image);

    if (format === undefined) {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({
      error_code: "INVALID_DATA.",
      error_description:
        "Os dados fornecidos no corpo da requisição são inválidos.",
    });
  }

  // DB MONTH VALIDATE

  try {
    const date = data.measure_datetime.split("-")[1]
    const row : boolean = await services.meterMonthValidate(parseInt(date), data.customer_code);

    if (!row) {
      throw new Error("STOP!");
    }
  } catch (error) {
    return res.status(400).send({
      error_code: "DOUBLE_REPORT.",
      error_description: "Já existe uma leitura para este tipo no mês atual.",
    });
  }

  // AI INTEGRATION && LINK GENERATION

  try {
    const uuid = await generateUniqueUUID("tbl_measure", "measure_uuid");
    const analysisText: string = await services.meterAnalysis(
      [format.mimeType, format.base64],
      data.measure_type
    );

    const value: number = parseFloat(analysisText);
    // const image_url : string = linkGen(format.base64) || "none"
    const convert = await convertBase64ToTempUrl(data.image);

    const result = await services.createMeasurementRecord(uuid, data, value, convert.url);

    return res.status(200).json({
      image_url: convert.url,
      measure_value: value,
      measure_uuid: uuid
    });
  } catch (error) {
    return res.status(500).json({
      error_code: "Problemas do Servidor.",
      error_description: "Erro no servidor.",
    });
  }
});

export default router;
