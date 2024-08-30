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

interface ConfirmAnalyzedValue {
  measure_uuid: string;
  confirmed_value: number;
}
interface ListingCostumerMeasures {
  costumer_code: string;
  measure_type: string | undefined;
}

router.post("/upload", async (req: Request, res: Response): Promise<void> => {
  let data: UploadMeterToAnalysis;
  let format: ResBase64 | undefined;

  // DATA VALIDATE

  try {
    data = req.body;
    format = base64FormatValidation(data.image);
    const validate: boolean = !isNaN(new Date(data.measure_datetime).getTime());

    if (
      !validate ||
      data.customer_code.length !== 36 ||
      format === undefined ||
      (data.measure_type.toLowerCase() !== "water" &&
        data.measure_type.toLowerCase() !== "gas")
    ) {
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

  // CONFIRM COSTUMER

  try {
    const validate: boolean = await services.costumerCodeConfirm(
      data.customer_code
    );

    if (!validate) {
      throw new Error();
    }
  } catch (error) {
    res.status(404).json({
      error_code: "COSTUMER_NOT_FOUND.",
      error_description: "Cliente não encontrado.",
    });
    return;
  }

  // DB MONTH VALIDATE

  try {
    const date: string = data.measure_datetime.split("-")[1];
    const row: boolean = await services.meterMonthValidate(
      parseInt(date),
      data.customer_code,
      data.measure_type
    );

    if (!row) {
      throw new Error();
    }
  } catch (error) {
    res.status(409).json({
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

    if (data.measure_uuid.length !== 36) {
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
      error_description: "Leitura não encontrada.",
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
      error_description: "Leitura já confirmada.",
    });
    return;
  }

  // UPDATE CONFIRMED MEASURE VALUE

  try {
    await services.updateConfirmedValue(
      data.confirmed_value,
      data.measure_uuid
    );

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

router.get("/:costumer_code/list", async (req: Request, res: Response): Promise<void> => {
    let data: ListingCostumerMeasures;

    // DATA VALIDATE

    try {
      const type: string | undefined = req.query.measure_type as string;
      data = {
        costumer_code: req.params.costumer_code,
        measure_type: type,
      };

      if (type !== undefined) {
        if (type.toLowerCase() !== "gas" && type.toLowerCase() !== "water") {
          throw new Error();
        }
      }
    } catch (error) {
      res.status(400).json({
        error_code: "INVALID_TYPE.",
        error_description: "Tipo de medição não permitida.",
      });
      return;
    }

    try {
      const result = await services.getAllMeasuresCostumer(
        data.costumer_code,
        data.measure_type
      ) as any[];

      if (result.length <= 0) {
        throw new Error();
      }

      res.status(200).json({
        costumer_code: data.costumer_code,
        measures: result,
      });
      return;
    } catch (error) {
      res.status(400).json({
        error_code: "MEASURES_NOT_FOUND.",
        error_description: "Nenhum registro encontrado.",
      });
      return;
    }
  }
);

export default router;
