export * from './types';
export * from './utils';

import { FileDocument, CodeChunk } from './types';
import { extractChunksFromFile } from './utils';

/**
 * Builds chunks from a list of documents.
 * @param documents List of FileDocument to process.
 * @param maxChunkSize Maximum character count per chunk.
 * @returns A promise that resolves to an array of CodeChunk.
 */
export const buildChunks = async (
  documents: FileDocument[],
  maxChunkSize: number = 2000
): Promise<CodeChunk[]> => {
  const chunks: CodeChunk[] = [];

  for (const document of documents) {
    const fileChunks = await extractChunksFromFile(document.path, maxChunkSize);
    chunks.push(...fileChunks);
  }

  return chunks;
};
