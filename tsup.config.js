import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/errors.ts'],
  format: ['cjs', 'esm'],
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
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    }
  },
})
