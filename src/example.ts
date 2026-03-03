import {
  buildDocuments,
  readDirRecursiveFiltered,
  buildChunks
} from './index';

const main = async () => {
  // Use current directory for example
  const rootDir = process.cwd();

  const files = await readDirRecursiveFiltered(rootDir, ['.ts', '.js', '.tsx']);

  const documents = await buildDocuments(rootDir, files);

  console.log('Total arquivos:', documents.length);

  const chunks = await buildChunks(documents);

  for (const chunk of chunks) {
    if (chunk.charCount > 2000) {
      console.log('Large chunk found:', chunk.elementName, chunk.charCount);
    }
  }

  console.log('Processo encerrado. Total de chunks:', chunks.length);
};

main().catch(console.error);
