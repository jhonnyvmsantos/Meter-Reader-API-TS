import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import express from "express";
import routes from "./routes";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
export const port = process.env.PORT || 3333;

app.use(cors());

app.use(express.json());

app.use("/api", routes);

app.use('/images', express.static(path.join(__dirname, '../assets/image/temp')));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// GOOGLE_GEMINI_API CONFIGURATION

function setApiKey(): string {
  const key: string | undefined = process.env.GEMINI_API_KEY;

  if (key === undefined) {
    throw new Error(
      `A \"API_KEY\", localizada no arquivo \".env\", não está definida.`
    );
  }

  return key;
}

const api_key: string = setApiKey();
const genAI = new GoogleGenerativeAI(api_key);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export { genAI, model };