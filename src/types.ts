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
  /**
   * Deve indicar exatamente a quantidade total de caracteres do chunk
   */
  charCount: number;
  /**
   * Deve indicar exatamente a posição inicial do chunk
   */
  charStart: number;
  /**
   * Deve indicar exatamente a posição final do chunk
   */
  charEnd: number;
  content: string;
};
