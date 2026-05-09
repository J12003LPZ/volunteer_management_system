import { build } from 'esbuild';

await build({
  entryPoints: ['server/src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'api/server-bundle.cjs',
  external: ['better-sqlite3'],
  banner: {
    js: "const _importMetaUrl = require('url').pathToFileURL(__filename).href;",
  },
  define: {
    'import.meta.url': '_importMetaUrl',
  },
});

console.log('Server bundled to api/_server.cjs');
