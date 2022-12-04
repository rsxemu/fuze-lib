import pkg from 'ts-jest';
const { pathsToModuleNameMapper } = pkg;

import { readFile } from 'fs/promises';

// import { compilerOptions } from './tsconfig.json';
const options = JSON.parse(await readFile(new URL('./tsconfig.json', import.meta.url)));
const compilerOptions = options.compilerOptions;

const mnm = compilerOptions.paths ? {
    "moduleNameMapper": pathsToModuleNameMapper(
        compilerOptions.paths,
        /* { prefix: '<rootDir>/' } */
    )
} : {};

export default {
    ...mnm,
    "preset": 'ts-jest',
    "extensionsToTreatAsEsm": [".ts"],
    // "roots": [
    //     "<rootDir>/src"
    // ],
    "moduleDirectories": [
        "node_modules",
        "src"
    ],
    // "moduleFileExtensions": [
    //     "js",
    //     "json",
    //     "ts"
    // ],
    "testMatch": [
        "**/test/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    // "coverageDirectory": "../coverage",
    // "moduleNameMapper": {
    //     "src/(.*)": "<rootDir>/bin/$1"
    // }
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    globals: {
        "ts-jest": {
            useESM: true,
            isolatedModules: true,
        },
    },
}