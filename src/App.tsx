import CurrentWeatherCard from "./components/CurrentWeatherCard";
import DailyForecast from "./components/DailyForecast";
import HourlyForecast from "./components/HourlyForecast";

function App() {
  return (
    // min-h-screen: コンテンツが少なくても画面いっぱいに背景を伸ばす
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-400 bg-gradient-to-br">
      <main className="flex w-full max-w-sm flex-col gap-4 p-4">
        {/* ===== メイン画面 ===== */}
        <CurrentWeatherCard />

        {/* ===== 1時間ごとの予報 ===== */}
        <HourlyForecast />

        {/* ===== 7日間の予報 ===== */}
        <DailyForecast />
      </main>

      <footer className="bottom-2 text-xs text-slate-500">
        <p>
          <small>&copy; 2025 Hosh</small>
        </p>
      </footer>
    </div>
  );
}

export default App;
