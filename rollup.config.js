import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const plugins = [
  resolve(),
  commonjs(),
  json(),
  builtins(),
  babel({
    exclude: 'node_modules/**' // only transpile our source code
  })
];

const external = Object.keys(
  Object.assign({}, pkg.peerDependencies, pkg.dependencies)
);

export default [
  /**
   * browser builds
   */
  {
    input: 'lib/index.js',
    treeshake: false,
    output: [
      { file: pkg.browser, format: 'cjs', sourcemap: false },
      { file: pkg.module, format: 'es', sourcemap: false }
    ],
    plugins,
    external
  },

  /**
   * Node.js build
   */
  {
    input: 'lib/index.js',
    treeshake: false,
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: false }
    ],
    plugins,
    external
  }
];