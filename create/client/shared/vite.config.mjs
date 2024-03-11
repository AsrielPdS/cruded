import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let root = dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  resolve: {
    alias: {
      "style.css": require.resolve("galhui/themes/theme_css")
    }
  }
})