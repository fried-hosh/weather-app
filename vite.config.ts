import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts", // セットアップ用のファイルパス
  },
  server: {
    host: "0.0.0.0", // ローカルネットワークの他端末からもアクセスできるようにする。 家以外のwifiでは消すこと。
    port: 5173, // 明示しておくとわかりやすい（なくてもデフォルト5173）
    proxy: {
      // '/api' という文字列で始まるリクエストが来たら、
      // ポート3000のサーバーに転送する設定
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
