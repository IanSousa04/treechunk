export * from './types';
export * from './utils';

import { FileDocument, CodeChunk } from './types';
import { extractChunksFromFile, readDirRecursiveFiltered, buildDocuments } from './utils';

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

export type GenerateChunksOptions = {
  rootDir: string;
  extensions?: string[];
  ignoreDirs?: string[];
  maxChunkSize?: number;
};

/**
 * Simplified API to generate chunks directly from a root directory.
 * @param options Configuration options for chunk generation.
 * @returns A promise that resolves to an array of CodeChunk.
 */
export const generateChunks = async (
  options: GenerateChunksOptions
): Promise<CodeChunk[]> => {
  const {
    rootDir,
    extensions = ['.ts', '.js', '.tsx', '.jsx'],
    ignoreDirs,
    maxChunkSize = 2000,
  } = options;

  const files = await readDirRecursiveFiltered(rootDir, extensions, ignoreDirs);
  const documents = await buildDocuments(rootDir, files);
  return buildChunks(documents, maxChunkSize);
};
