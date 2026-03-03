import 'dotenv/config';
import {
  buildDocuments,
  extractChunksFromFile,
  readDirRecursiveFiltered,
} from './utils';
import { CodeChunk, FileDocument } from './types';

const main = async () => {
  const rootDir = 'C:\\Dev\\EDsys';

  const files = await readDirRecursiveFiltered(rootDir, ['.ts', '.js', '.tsx']);

  const documents = await buildDocuments(rootDir, files);

  console.log('Total arquivos:', documents.length);

  // console.log(JSON.stringify(documents[0], null, 2));

  const chunks = await buildChunks(documents);

  for (const chunk of chunks) {
    if (chunk.charCount > 2000) {
      console.log('chunk', chunk);
    }
  }

  console.log('Processo encerrado.', chunks.length);
};

// Refatorar para separar os chunks em 2000 caracteres, adicionando propriedades charStart e charEnd, que indicam o inicio e fim do chunk
const buildChunks = async (documents: FileDocument[]): Promise<CodeChunk[]> => {
  console.log('Criando chunks...');

  const chunks: CodeChunk[] = [];

  for (const document of documents) {
    const fileChunks = await extractChunksFromFile(document.path);
    chunks.push(...fileChunks);
  }

  return chunks;
};

main();
