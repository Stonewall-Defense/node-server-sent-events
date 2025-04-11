import typescriptEslint from "@typescript-eslint/eslint-plugin";
import node from "eslint-plugin-n";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/*.test.ts"],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:n/recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        node,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        indent: ["error", 4, {
            SwitchCase: 1,
        }],

        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                "args": "all",
                "argsIgnorePattern": "^_$",
                "caughtErrors": "all",
                "caughtErrorsIgnorePattern": "^_$",
                "destructuredArrayIgnorePattern": "^_",
                "varsIgnorePattern": "^_$",
                "ignoreRestSiblings": true,
            },
        ],
        "n/no-extraneous-import": "off",
        "n/no-missing-import": "off",
    },

    files: [
        "**/*.ts",
    ],
}];