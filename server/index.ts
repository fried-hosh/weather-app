import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // dist/server/index.js
const clientDir = path.resolve(__dirname, ".."); // distを指す。tsにおける__dirnameはjsの位置を指すから、一個上はdist。

const app = express();
const port = 3000; // Viteとは別のポートで動かす

// 本番環境で使われる行。distの中の静的ファイルをExpressが配信するための設定
app.use(express.static(clientDir));

// テスト用のAPIエンドポイント
// Expressに/api/testというhttpリクエストがきたらjsonデータを返す
app.get("/api/test", (_req, res) => {
  res.json({ ok: true, message: "Hello from Express server!" });
});

// ===== SPAフォールバック =====

// 本番(express.static(dist) で配信)だと、Reactで定義したURL(distにないパス)がExpressサーバーに送られてきたとき(ページリロードされたとき等)に404を返す。
// → index.htmlに書かれたReactが起動せず、ページが表示されなくなって困る。
// それを避けるために、とりあえずindex.htmlを返してもらうようにするための設定
app.use((req, res, next) => {
  // GETリクエスト(ページを見たいリクエスト)だけを通す。それ以外（POST/PUT等）は404
  if (req.method !== "GET") return next();

  // APIは除外（定義済みなら上のapp.getが反応するし、そうじゃないなら404）
  if (req.path.startsWith("/api/")) return next();

  // ドットを含む = だいたい実ファイル（/assets/app.jsとか画像アセットとか）は404
  // ここまで来た .付きパスはだいたい壊れたアセット参照だから404に回す
  if (req.path.includes(".")) return next();

  // 最後までreturn next();に該当しなかったリクエスト
  // （/aaaaとか/noexistとか）は常に index.html を返す
  // → index.htmlに書かれているReactアプリが読み込まれる
  // → 起動したReact Routerがそのアドレスを見て、(存在すれば)正しい画面を表示する
  res.sendFile(path.join(clientDir, "index.html"));
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
