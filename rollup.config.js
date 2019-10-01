import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default ["dom", "html"].map(name => ({
  input: `src/${name}/index.ts`,
  output: [
    {
      file: `dist/${name}.esm.js`,
      format: "esm"
    },
    {
      file: `dist/${name}.cjs.js`,
      format: "cjs"
    }
  ],
  plugins: [
    typescript(),
    terser({
      compress: false,
      mangle: {
        eval: false,
        keep_classnames: true,
        keep_fnames: true,
        module: true,
        properties: {
          regex: /^___/
        }
      },
      output: {
        beautify: true
      }
    })
  ]
}));
