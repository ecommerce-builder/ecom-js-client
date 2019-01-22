import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

const plugins = [
  resolve(),
  commonjs(),
  replace({
    'ECOM_VERSION': JSON.stringify(pkg.version)
  }),
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
      { file: pkg.module, format: 'es', sourcemap: false },
    ],
    plugins,
    external,
  },

  /**
   * Library build
   */
  {
    input: 'lib/index.js',
    treeshake: false,
    output: [
      {
        file: 'dist/ecom-min.js',
        format: 'umd',
        sourcemap: false,
        name: 'EcomClient',
      },
    ],
    plugins: [...plugins, babel(), uglify()]
  },
  {
    input: 'lib/index.js',
    treeshake: false,
    output: [
      {
        file: 'dist/ecom.js',
        format: 'umd',
        sourcemap: 'inline',
        name: 'EcomClient',
      },
    ],
    plugins: [...plugins, babel()]
  }
];
