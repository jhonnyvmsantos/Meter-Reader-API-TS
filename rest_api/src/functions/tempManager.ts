import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { port } from '..';

const TEMP_DIR = path.join(__dirname, '../temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export async function convertBase64ToTempUrl(base64Data: string): Promise<{ url: string, fileName: string }> {
  // Validação do base64Data
  if (typeof base64Data !== 'string' || !base64Data.startsWith('data:image/')) {
    throw new Error('Base64 data inválido.');
  }

  const base64 = base64Data.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');
  const fileName = `${uuidv4()}.png`;
  const filePath = path.join(TEMP_DIR, fileName);
  
  // Salvar o arquivo
  await writeFile(filePath, buffer);

  // Gerar URL temporária
  const url = `http://localhost:${port}/images/${fileName}`;

  setTimeout(async () => {
    try {
      await unlink(filePath);
      console.log(`Arquivo removido: ${filePath}`);
    } catch (error) {
      console.log(`Erro ao remover o arquivo: ${error}`);
    }
  }, 60000); // 1 minuto

  return { url, fileName };
}
