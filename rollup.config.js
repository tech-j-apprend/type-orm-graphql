import babel from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild';

export default [
    {
        input: `src/index.ts`,
        plugins: [
          babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**', // Exclude node_modules from Babel transformation
            presets: ['@babel/preset-env'],
          }),
          esbuild({
            tsconfig: './tsconfig.json',
          }),
        ],
        output: [
          {
            file: `cjs/index.cjs.js`,
            format: 'cjs',
            sourcemap: true,
            exports: 'named',
          },
        ],
        external: ['@graphql-codegen/cli', 'graphql', 'lodash']
    }, {
        input: `src/index.ts`,
        plugins: [
          babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**', // Exclude node_modules from Babel transformation
            presets: ['@babel/preset-env', {
                targets: "> 0.25%, not dead",
            }],
          }),
          esbuild()],
        output: [
          {
            file: `esm/index.esm.js`,
            format: 'esm',
            sourcemap: true,
            exports: 'named',
          },
        ],
        external: ['graphql', 'lodash']
    },
    {
        input: `src/index.ts`,
        plugins: [dts({
            tsconfig: './tsconfig.json',
            compilerOptions: {
              sourceMap: true,
            }
        })],
        output: {
          file: `esm/index.esm.ts`,
          format: 'es',
        },
      },
      {
        input: `src/index.ts`,
        plugins: [dts({
            tsconfig: './tsconfig.json',
            compilerOptions: {
              sourceMap: true,
            }
        })],
        output: {
          file: `cjs/index.cjs.ts`,
          format: 'es',
        },
      },
         
]   
