import CurrentWeatherCard from "./components/CurrentWeatherCard";
import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";
import AppFooter from "./components/AppFootre";

function App() {
  return (
    // 全体の背景。青のグラデーション
    <div className="flex flex-col bg-blue-500 text-white">
      <main className="flex w-full flex-1 flex-col">
        {/* メディアクエリ */}
        <div
          className="
          sm:mx-auto sm:max-w-3xl sm:px-4
          lg:max-w-5xl lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6
          lg:rounded-3xl lg:border-2 lg:border-cyan-300 lg:p-5 lg:my-16 lg:shadow-2xl
          lg:bg-gradient-to-r lg:from-sky-400/80 lg:to-indigo-700/80
          "
        >
          {/* ===== 上部エリア(現在の天気 + 時間予報) ===== */}
          <div className="flex flex-col gap-6 p-4 pt-6 pb-8 ">
            <CurrentWeatherCard />

            <HourlyForecast />
          </div>

          {/* ===== 下部エリア(7日間の天気予報) ===== */}
          <DailyForecast />
        </div>
      </main>

      {/* フッター（PC・タブレット用）: スマホ版は別個Dailyに埋め込み */}
      <AppFooter className="text-slate-200 hidden sm:block" />
    </div>
  );
}

export default App;
