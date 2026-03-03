# Fila Impressão

Uma biblioteca TypeScript estruturada para análise de código e extração de chunks (pedaços) de arquivos fonte. Esta ferramenta utiliza o compilador TypeScript para navegar na Árvore de Sintaxe Abstrata (AST) e identificar funções, classes, interfaces e outros elementos.

## Funcionalidades

- Varredura recursiva de diretórios com filtros de extensão.
- Extração de metadados de arquivos (tamanho, hash MD5, data de modificação).
- Identificação de elementos de código via AST (TypeScript).
- Divisão automática de elementos grandes em chunks de tamanho configurável (padrão 2000 caracteres).
- Suporte a ESM e CommonJS.

## Instalação

```bash
npm install fila-impressao
```

## Uso Básico

```typescript
import { readDirRecursiveFiltered, buildDocuments, buildChunks } from 'fila-impressao';

async function run() {
  const rootDir = './src';

  // 1. Listar arquivos filtrados
  const files = await readDirRecursiveFiltered(rootDir, ['.ts', '.tsx']);

  // 2. Construir documentos com metadados e conteúdo
  const documents = await buildDocuments(rootDir, files);

  // 3. Extrair chunks de código (máximo 2000 caracteres por chunk)
  const chunks = await buildChunks(documents, 2000);

  console.log(chunks);
}

run();
```

## API

### `readDirRecursiveFiltered(dir, extensions, ignoreDirs?)`
Lista todos os arquivos em um diretório recursivamente, filtrando por extensões e ignorando pastas específicas.

### `buildDocuments(rootDir, files)`
Lê o conteúdo dos arquivos e gera objetos `FileDocument` com metadados.

### `extractChunksFromFile(filePath, maxChunkSize?)`
Analisa um único arquivo e extrai elementos de código como chunks.

### `buildChunks(documents, maxChunkSize?)`
Processa uma lista de documentos e retorna todos os chunks encontrados.

## Licença

ISC
