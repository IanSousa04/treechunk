export type FileDocument = {
  id: string;
  path: string;
  relativePath: string;
  extension: string;
  size: number;
  content: string;
  lastModified: Date;
};

export type CodeChunk = {
  fileName: string;
  elementName: string;
  elementType: string;
  charCount: number;
  charStart: number;
  charEnd: number;
  content: string;
};
