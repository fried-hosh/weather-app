// eslint.config.mjs
// Vite + React + TypeScript + Tailwind 用の共通ボイラープレート

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwind from "eslint-plugin-tailwindcss";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default tseslint.config(
  // 無視してほしいパス
  { ignores: ["dist", "node_modules"] },

  {
    // 対象ファイル
    files: ["src/**/*.{ts,tsx}"],

    // JSの基本設定
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },

    // プラグイン登録
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      tailwindcss: tailwind,
    },

    // ベースになるおすすめ設定をまとめて適用
    extends: [js.configs.recommended, ...tseslint.configs.recommended, ...tailwind.configs["flat/recommended"]],

    // 追加・上書きしたいルール
    rules: {
      // React Hooks 用の recommended ルールをそのまま使う
      ...reactHooks.configs.recommended.rules,

      // Vite テンプレに入ってるやつと同じ
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // Tailwind クラス関連
      "tailwindcss/no-custom-classname": "warn", // Tailwind じゃないクラス名に文句言うやつ

      "tailwindcss/classnames-order": "warn", // 並び順を整えろって言われるやつ

      "tailwindcss/enforces-shorthand": "off", // h-8 w-8 → size-8 にしろってやつ

      "tailwindcss/no-contradicting-classname": "error", // px-2 px-4 みたいな矛盾を検出
    },

    // Tailwind 設定ファイルの場所
    settings: {
      tailwindcss: {
        config: "tailwind.config.js",
      },
    },
  }
);
