import typescript from 'rollup-plugin-typescript';
import { uglify } from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

const plugins = [
  typescript(),
  replace({
    'ECOM_VERSION': pkg.version
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
    input: 'lib/index.ts',
    treeshake: false,
    output: [
      { file: pkg.browser, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true },
    ],
    plugins,
    external,
  },

  /**
   * Library build
   */
  {
    input: 'lib/index.ts',
    treeshake: false,
    output: [
      {
        file: 'dist/ecom-min.js',
        format: 'umd',
        sourcemap: false,
        name: 'EcomClient',
        globals: {
          idb: 'idb'
        }
      },
    ],
    plugins: [...plugins, uglify()],
    external,
  },
  {
    input: 'lib/index.ts',
    treeshake: false,
    output: [
      {
        file: 'dist/ecom.js',
        format: 'umd',
        sourcemap: 'inline',
        name: 'EcomClient',
        globals: {
          idb: 'idb'
        }
      },
    ],
    plugins: [...plugins],
    external,
  }
];
