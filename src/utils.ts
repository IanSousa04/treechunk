import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, relative, basename } from 'path';
import crypto from 'crypto';
import ts from 'typescript';
import { CodeChunk, FileDocument } from './types';

export async function readDirRecursiveFiltered(
  dir: string,
  extensions: string[],
  ignoreDirs: string[] = [
    'buildFiles',
    'node_modules',
    '.git',
    'dist',
    'build',
    '.firebase',
    '.vscode',
    '.github',
    '.husky',
    'migration',
  ],
): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (ignoreDirs.includes(entry.name)) {
          return [];
        }

        return readDirRecursiveFiltered(fullPath, extensions, ignoreDirs);
      }

      if (
        entry.isFile() &&
        extensions.some((ext) => entry.name.endsWith(ext))
      ) {
        return fullPath;
      }

      return [];
    }),
  );

  return files.flat();
}

export async function buildDocuments(
  rootDir: string,
  files: string[],
): Promise<FileDocument[]> {
  const documents: FileDocument[] = [];

  for (const filePath of files) {
    const fileStat = await stat(filePath);
    const content = await readFile(filePath, 'utf-8');

    documents.push({
      id: crypto.createHash('md5').update(filePath).digest('hex'),
      path: filePath,
      relativePath: relative(rootDir, filePath),
      extension: extname(filePath),
      size: fileStat.size,
      content,
      lastModified: fileStat.mtime,
    });
  }

  return documents;
}

/**
 * Creates a CodeChunk with exactly calculated metadata.
 */
function createCodeChunk(
  fileName: string,
  elementName: string,
  elementType: string,
  content: string,
  charStart: number,
): CodeChunk {
  return {
    fileName,
    elementName,
    elementType,
    content,
    charStart,
    charEnd: charStart + content.length,
    charCount: content.length,
  };
}

export async function extractChunksFromFile(
  filePath: string,
  maxChunkSize: number = 2000,
): Promise<CodeChunk[]> {
  if (maxChunkSize <= 0) {
    throw new Error('maxChunkSize must be greater than 0');
  }

  const sourceCode = await readFile(filePath, 'utf-8');

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  const chunks: CodeChunk[] = [];
  const fileName = basename(filePath);

  function pushChunk(name: string, type: string, node: ts.Node) {
    const fullContent = node.getText(sourceFile);
    const nodeStart = node.getStart(sourceFile);

    if (fullContent.length <= maxChunkSize) {
      chunks.push(
        createCodeChunk(fileName, name, type, fullContent, nodeStart),
      );
    } else {
      for (let i = 0; i < fullContent.length; i += maxChunkSize) {
        const chunkContent = fullContent.substring(i, i + maxChunkSize);
        const chunkStart = nodeStart + i;
        const partNumber = Math.floor(i / maxChunkSize) + 1;

        chunks.push(
          createCodeChunk(
            fileName,
            `${name} (part ${partNumber})`,
            type,
            chunkContent,
            chunkStart,
          ),
        );
      }
    }
  }

  for (const statement of sourceFile.statements) {
    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isEnumDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement)) &&
      statement.name
    ) {
      if (ts.isIdentifier(statement.name)) {
        pushChunk(
          statement.name.text,
          ts.SyntaxKind[statement.kind],
          statement,
        );
      }
    }

    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          pushChunk(decl.name.text, 'variable', decl);
        }
      }
    }

    if (ts.isExportAssignment(statement)) {
      pushChunk('default_export', 'export', statement);
    }

    if (ts.isClassDeclaration(statement) && statement.name) {
      for (const member of statement.members) {
        if ('name' in member && member.name && ts.isIdentifier(member.name)) {
          pushChunk(
            `${statement.name.text}.${member.name.text}`,
            ts.SyntaxKind[member.kind],
            member,
          );
        }
      }
    }
  }

  return chunks;
}
