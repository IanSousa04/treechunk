# TreeChunk

Uma biblioteca TypeScript estruturada para análise de código e extração de chunks (pedaços) de arquivos fonte. Esta ferramenta utiliza o compilador TypeScript para navegar na Árvore de Sintaxe Abstrata (AST) e identificar funções, classes, interfaces e outros elementos.

## Funcionalidades

- **Simplificado**: Gere chunks com apenas uma chamada de função.
- **AST-based**: Utiliza o parser do TypeScript para identificação precisa de elementos de código.
- **Auto-splitting**: Divide elementos grandes em múltiplos chunks respeitando limites de caracteres.
- **Metadados**: Inclui posição de caracteres (start/end) e informações do arquivo.
- **Híbrido**: Suporte nativo para ESM e CommonJS.

## Instalação

```bash
npm install treechunk
```

## Uso Rápido

O modo mais simples de usar a TreeChunk é através da função `generateChunks`:

```typescript
import { generateChunks } from 'treechunk';

async function run() {
  const chunks = await generateChunks({
    rootDir: './src',
    ignoreDirs: ['node_modules', 'dist'], // Opcional
    maxChunkSize: 2000 // Opcional, padrão é 2000
  });

  console.log(chunks);
}

run();
```

## API Principal

### `generateChunks(options)`
Função orquestradora que realiza todo o fluxo de varredura, leitura e extração.

**Opções (`GenerateChunksOptions`):**
- `rootDir`: (Obrigatório) Caminho raiz para a varredura.
- `extensions`: (Opcional) Array de extensões (ex: `['.ts', '.js']`).
- `ignoreDirs`: (Opcional) Pastas a serem ignoradas.
- `maxChunkSize`: (Opcional) Limite máximo de caracteres por chunk.

## API de Baixo Nível

Se precisar de mais controle, você pode usar as funções internas:

- `readDirRecursiveFiltered`: Lista arquivos recursivamente.
- `buildDocuments`: Transforma arquivos em documentos com metadados.
- `extractChunksFromFile`: Extrai chunks de um arquivo específico.
- `buildChunks`: Processa uma lista de documentos para gerar chunks.

## Tipos

```typescript
type CodeChunk = {
  fileName: string;
  elementName: string;
  elementType: string;
  charCount: number;
  charStart: number;
  charEnd: number;
  content: string;
};
```

## Licença

ISC
