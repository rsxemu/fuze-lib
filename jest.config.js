export default {
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
        "**/__tests__/**/*.+(ts|tsx|js)",
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