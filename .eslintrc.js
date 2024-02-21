module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json", tsconfigRootDir: __dirname, sourceType: "module", ecmaVersion: 2020
    },
    plugins: ["@typescript-eslint"],
    extends: ["plugin:@typescript-eslint/recommended", "prettier", "plugin:prettier/recommended"],
    root: true,
    env: {
        node: true, jest: true
    },
    ignorePatterns: [".eslintrc.js"],
    rules: {
        "@typescript-eslint/naming-convention": ["error", {
            "selector": "interface", "format": ["PascalCase"], "custom": {
                "regex": "^I[A-Z]", "match": false
            }
        }],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": ["error", {
            "argsIgnorePattern": "^_", "varsIgnorePattern": "^_"
        }],
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        // "@typescript-eslint/explicit-module-boundary-types": ["error", {
        //     // "allowedNames": [],
        //     "allowArgumentsExplicitlyTypedAsAny": false,
        //     "allowDirectConstAssertionInArrowFunctions": false,
        //     "allowHigherOrderFunctions": false,
        //     "allowTypedFunctionExpressions": true
        // }],
        "prefer-const": "error",
        "prettier/prettier": ["error", {
            "endOfLine": "auto"
        }]
    },
    settings: {}
}
