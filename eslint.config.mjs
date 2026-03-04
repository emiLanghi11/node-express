import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["eslint.config.mjs"] },
  js.configs.recommended,
  {
    ignores: ["public/js/**"],
    rules: {
      "no-unused-vars": ["warn", { "ignoreRestSiblings": true }],
      "no-undef": "error",
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: globals.node,
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    files: ["public/js/**/*.js"],
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error",
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        io: "readonly",
        google: "readonly",
      },
    },
  },
];