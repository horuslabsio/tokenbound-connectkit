import { resolve } from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import replace from "@rollup/plugin-replace"; // Use the Rollup version of replace

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["starknet"],
    },
    emptyOutDir: false,
    target: "es2020",
    lib: {
      entry: {
        tokenboundkit: resolve(__dirname, "src/main.ts"),
        tokenboundAccount: resolve(
          __dirname,
          "src/connectors/tokenboundAccount/index.ts",
        ),
      },
      formats: ["es", "cjs"],
    },
  },
  plugins: [
    svelte({ emitCss: false }),
    dts({
      entryRoot: resolve(__dirname, "src"),
      insertTypesEntry: true,
    }),
    replace({
      preventAssignment: true,
      // Replace eval with a no-op function to bypass eval usage
      values: {
        'eval': '(() => {})'
      }
    }),
  ],
});
