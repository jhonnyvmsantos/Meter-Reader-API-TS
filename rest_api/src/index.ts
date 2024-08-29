import express from "express";
import cors from "cors";
import routes from "./routes";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs"

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

app.use(cors());

app.use(express.json());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// GOOGLE_GEMINI_API CONFIGURATION

function setApiKey(): string {
  const key: string | undefined = process.env.API_KEY;

  if (key === undefined) {
    throw new Error(
      `A \"API_KEY\", localizada no arquivo \".env\", não está definida.`
    );
  }

  return key;
}

const api_key: string = setApiKey();
export const genAI = new GoogleGenerativeAI(api_key);

// TEST ZONE INTEGRATION ---------------------------------------------------------------------

import { Buffer } from "buffer";
import { Part } from "@google/generative-ai";

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const prompt = "Analyze the image...";

async function imgAnalize(mimeType: string, path: string): Promise<void> {
  const image: Part = {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType: mimeType,
    },
  };

  const result = await model.generateContent([image]);
  console.log(result.response.text())
}

imgAnalize("image/png", "src/image.png");