import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { port } from '..';

// Diretório para armazenar imagens temporárias
const TEMP_DIR = path.join(__dirname, '../../assets/image/temp');

// Assegura que o diretório existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Função para salvar a imagem Base64 e gerar um link temporário
export async function convertBase64ToTempUrl(base64Data: string): Promise<{ url: string, fileName: string }> {
  // Validação do base64Data
  if (typeof base64Data !== 'string' || !base64Data.startsWith('data:image/')) {
    throw new Error('Base64 data inválido.');
  }

  // Decodificar o Base64 e salvar a imagem
  const base64 = base64Data.split(',')[1]; // Remove o prefixo data:image/png;base64,
  const buffer = Buffer.from(base64, 'base64');
  const fileName = `${uuidv4()}.png`;
  const filePath = path.join(TEMP_DIR, fileName);
  
  // Salvar o arquivo
  await writeFile(filePath, buffer);

  // Gerar URL temporária
  const url = `http://localhost:${port}/images/${fileName}`;

  return { url, fileName };
}
