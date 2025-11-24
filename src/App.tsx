import CurrentWeatherCard from "./components/CurrentWeatherCard";
import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";

function App() {
  return (
    // 全体の背景。青のグラデーション
    // min-h-screen: コンテンツが少なくても画面いっぱいに背景を伸ばす
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-400 to-blue-600 text-white">
      <main className="flex w-full flex-1 flex-col">
        {/* ===== 上部エリア(現在の天気 + 時間予報) ===== */}
        <div className="flex flex-col gap-6 p-4 pb-8 pt-8">
          <CurrentWeatherCard />

          <HourlyForecast />
        </div>

        {/* ===== 下部エリア(7日間の天気予報) ===== */}
        <div className="mt-auto flex-1">
          <DailyForecast />
        </div>
      </main>

      <footer className="bottom-2 text-center text-xs text-slate-200">
        <p>
          <small>&copy; 2025 Hosh</small>
        </p>
      </footer>
    </div>
  );
}

export default App;
