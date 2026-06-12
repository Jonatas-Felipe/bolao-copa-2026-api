import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 3001,
  },
  build: {
    outDir: 'dist',
    ssr: true,
    rollupOptions: {
      input: 'src/shared/infra/http/server.ts',
      output: {
        entryFileNames: 'server.js',
        format: 'es',
      },
    },
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/shared/infra/http/app.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'esbuild',
    }),
    tsconfigPaths(),
  ],
})
