const tsParser = require("@typescript-eslint/parser")
const tsPlugin = require("@typescript-eslint/eslint-plugin")
const prettierPlugin = require("eslint-plugin-prettier")
const eslintConfigPrettier = require("eslint-config-prettier")

module.exports = [
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**", "eslint.config.js"]
    },
    eslintConfigPrettier,
    {
        files: ["src/**/*.ts", "apps/**/*.ts", "libs/**/*.ts", "test/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname,
                sourceType: "module",
                ecmaVersion: 2020
            },
            globals: {
                __dirname: "readonly",
                Buffer: "readonly",
                console: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                jest: "readonly"
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            prettier: prettierPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "@typescript-eslint/naming-convention": ["error", {
                selector: "interface",
                format: ["PascalCase"],
                custom: {
                    regex: "^I[A-Z]",
                    match: false
                }
            }],
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }],
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "prefer-const": "error",
            "prettier/prettier": ["error", {
                endOfLine: "auto"
            }]
        },
        settings: {}
    }
]
