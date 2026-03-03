import { generateChunks } from './index';

const main = async () => {
  console.log('Starting chunk generation with simplified API...');

  const chunks = await generateChunks({
    rootDir: process.cwd(),
    ignoreDirs: ['node_modules', 'dist', '.git'],
    maxChunkSize: 1000
  });

  console.log('Total chunks generated:', chunks.length);

  if (chunks.length > 0) {
    console.log('Example chunk:', {
      file: chunks[0].fileName,
      element: chunks[0].elementName,
      size: chunks[0].charCount
    });
  }
};

main().catch(console.error);
