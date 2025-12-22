import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // dist/server/index.js
const clientDir = path.resolve(__dirname, ".."); // distを指す。tsにおける__dirnameはjsの位置を指すから、一個上はdist。

const app = express();
const port = 3000;

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = process.env.WEATHER_API_BASE_URL ?? "https://api.weatherapi.com/v1";

if (!API_KEY) throw new Error("環境変数 WEATHER_API_KEY が設定されていません。");

// リクエストされたファイルがdist内にあるかどうかをチェック。あれば渡して終了、なければ下の行を実行。
app.use(express.static(clientDir));

// 天気情報を返すAPIエンドポイント

app.get("/api/weather", async (req, res) => {
  const queryCity = req.query.city;
  const city = typeof queryCity === "string" ? queryCity : "Tokyo";
  console.log("天気取得リクエスト city:", req.query.city);

  try {
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no&lang=ja`;

    const apiRes = await fetch(url);

    if (!apiRes.ok) {
      console.error("WeatherAPIがエラーを返しました。 status:", apiRes.status);
      return res.status(apiRes.status).json({ error: "天気データの取得に失敗しました。" });
    }

    const data = await apiRes.json();
    return res.json(data);
  } catch (error) {
    // サーバー側のエラーログ
    if (error instanceof Error) {
      console.error("ネットワークまたはサーバー内部のエラー:", error);
    } else {
      console.error("予期しない形式のエラー:", error);
    }
    // クライアントへ返す文言
    res.status(500).json({ error: "サーバー内部でエラーが発生しました。" });
  }
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
