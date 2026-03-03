import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, relative } from 'path';
import crypto from 'crypto';
import ts from 'typescript';
import { basename } from 'path';
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

export async function extractChunksFromFile(
  filePath: string,
): Promise<CodeChunk[]> {
  const sourceCode = await readFile(filePath, 'utf-8');

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  const chunks: CodeChunk[] = [];

  function pushChunk(name: string, type: string, node: ts.Node) {
    const content = node.getText(sourceFile);

    chunks.push({
      fileName: basename(filePath),
      elementName: name,
      elementType: type,
      charCount: content.length,
      content,
    });
  }

  for (const statement of sourceFile.statements) {
    // =========================
    // Named Declarations
    // =========================
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

    // =========================
    // Variable Statements
    // =========================
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          pushChunk(decl.name.text, 'variable', decl);
        }
      }
    }

    // =========================
    // Export Default (anonymous)
    // =========================
    if (ts.isExportAssignment(statement)) {
      pushChunk('default_export', 'export', statement);
    }

    // =========================
    // Classes → pegar membros também
    // =========================
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
