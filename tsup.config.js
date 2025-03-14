import { defineConfig } from 'tsup'
import { fixImportsPlugin } from 'esbuild-fix-imports-plugin'

export default defineConfig({
  entry: ['src/*.ts'],
  format: ['esm'],
  external: ['node:events', 'node:fs', 'node:fs/promises', 'node:path', 'node:stream'],
  splitting: false,
  clean: true,
  dts: true,
  target: 'node20',
  platform: 'node',
  outDir: 'dist',
  bundle: false,
  treeshake: true,
  tsconfig: './prod.tsconfig.json',
  esbuildOptions(options) {
    options.banner = {
      js: '"use strict";',
    }
  },
  outExtension: () => ({ js: '' }),
  esbuildPlugins: [fixImportsPlugin()],
})
