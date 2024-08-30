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

export interface ConfirmAnalyzedValue {
  measure_uuid: string;
  confirmed_value: number;
}

router.post("/upload", async (req: Request, res: Response): Promise<void> => {
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
    res.status(400).json({
      error_code: "INVALID_DATA.",
      error_description:
        "Os dados fornecidos no corpo da requisição são inválidos.",
    });
    return;
  }

  // DB MONTH VALIDATE

  try {
    const date: string = data.measure_datetime.split("-")[1];
    const row: boolean = await services.meterMonthValidate(
      parseInt(date),
      data.customer_code
    );

    if (!row) {
      throw new Error("STOP!");
    }
  } catch (error) {
    res.status(400).json({
      error_code: "DOUBLE_REPORT.",
      error_description: "Já existe uma leitura para este tipo no mês atual.",
    });
    return;
  }

  // AI INTEGRATION && LINK GENERATION

  try {
    const uuid: string = await generateUniqueUUID(
      "tbl_measure",
      "measure_uuid"
    );
    const analysisText: string = await services.meterAnalysis(
      [format.mimeType, format.base64],
      data.measure_type
    );

    const value: number = parseFloat(analysisText);
    const convert = await convertBase64ToTempUrl(data.image);

    await services.createMeasurementRecord(uuid, data, value, convert.url);

    res.status(200).json({
      image_url: convert.url,
      measure_value: value,
      measure_uuid: uuid,
    });
    return;
  } catch (error) {
    res.status(500).json({
      error_code: "Problemas do Servidor.",
      error_description: "Erro no servidor.",
    });
    return;
  }
});

router.patch("/confirm", async (req: Request, res: Response): Promise<void> => {
  let data: ConfirmAnalyzedValue;

  // DATA VALIDATE

  try {
    data = req.body;
  } catch (error) {
    res.status(400).json({
      error_code: "INVALID_DATA.",
      error_description:
        "Os dados fornecidos no corpo da requisição são inválidos.",
    });
    return;
  }

  // CONFIRM CODE

  try {
    const validate: boolean = await services.measureCodeConfirm(
      data.measure_uuid
    );

    if (!validate) {
      throw new Error("Leitura não encontrada.");
    }
  } catch (error) {
    res.status(404).json({
      error_code: "MEASURE_NOT_FOUND.",
      error_description: "Leitura do mês já realizada.",
    });
    return;
  }

  // HAS_CONFIRMED MEASURE VALIDATE

  try {
    const validate: boolean = await services.hasMeasureConfirmed(
      data.measure_uuid
    );

    if (!validate) {
      throw new Error("Leitura já confirmada.");
    }
  } catch (error) {
    res.status(409).json({
      error_code: "CONFIRMATION_DUPLICATE.",
      error_description: "Leitura do mês já realizada.",
    });
    return;
  }

  // UPDATE HAS_CONFIMED MEASURE VALUE

  try {
    await services.updateHasConfirmedValue(data.measure_uuid);

    res.status(200).json({
      success: true,
    });
    return;
  } catch (error) {
    res.status(500).json({
      error_code: "Problemas do Servidor.",
      error_description: "Erro no servidor.",
    });
    return;
  }
});

export default router;
