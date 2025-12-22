import CurrentWeatherCard from "../components/CurrentWeatherCard";
import HourlyForecast from "../components/HourlyForecast";
import DailyForecast from "../components/DailyForecast";
import AppFooter from "../components/AppFooter";
import { useWeather, fetchWeather } from "../hooks/useWeather";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Dashboard = () => {
  const [activeCity, setActiveCity] = useState("東京");
  const [isSearching, setIsSearching] = useState(false);
  const { data, isLoading } = useWeather(activeCity);

  const queryClient = useQueryClient();

  const onSearch = async (city: string): Promise<boolean> => {
    const nextCity = city.trim();
    if (!nextCity || nextCity === activeCity) return false;

    // 連打対策。検索中の二重送信を弾く。(現状はCurrentのJSX側でほぼ弾かれる)
    if (isSearching) return false;
    setIsSearching(true);

    try {
      // 画面切り替えの前にデータを先取りする。
      // ここで取得したデータは自動的にキャッシュされる。
      await queryClient.fetchQuery({
        queryKey: ["weather", nextCity],
        queryFn: () => fetchWeather(nextCity),
      });
      // 成功したときだけ画面表示を切り替える。(悲観的更新)
      // フェッチ成功 → 画面切り替え の順にすることでエラー時のUI保持が楽になる。
      setActiveCity(nextCity);
      // 成功
      return true;
    } catch (err) {
      // 失敗したらUIは変えない(activeCityを変えない) = UI保持
      const message = err instanceof Error ? err.message : "取得に失敗しました";
      window.alert(message);
      // 失敗
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  // 初回ロード中のみローディング表示
  if (isLoading && !data)
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-sky-400/80 to-indigo-700/80 text-white">
        <p className="text-xl font-medium animate-pulse">読み込み中...</p>
      </div>
    );

  // 初回から失敗等で表示するデータがない場合のみエラー画面を表示
  if (!data) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-sky-400/80 to-indigo-700/80 text-white">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">天気を取得できませんでした</p>
          <p className="opacity-90">時間を置いてから再度お試しください</p>
        </div>
      </div>
    );
  }

  // データ整形
  const current = data.current;
  const todayForecast = data.forecast.forecastday[0].day;
  const forecastDays = data.forecast.forecastday;

  // 風速変換(km/h → m/s)
  const windSpeedMs = (current.wind_kph * 1000) / 3600;

  // Hourlyに渡す用。現地時刻(localtime)を「その時間の00分」に丸めて、Hourlyの"Now"判定に使うキーを作る。
  const currentHourKey = makeCurrentHourKeyFromLocaltime(data.location.localtime);

  // UI
  return (
    // 全体の背景。青のグラデーション
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-sky-400/80 to-indigo-700/80 text-white">
      <main className="flex w-full flex-1 flex-col">
        {/* メディアクエリ */}
        <div
          className="
          sm:px-4
          lg:mx-auto lg:max-w-5xl lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6
          lg:rounded-3xl lg:border-2 lg:border-cyan-300/50 lg:ring-2 lg:p-5 lg:my-16 lg:shadow-2xl
          lg:bg-gradient-to-r lg:from-sky-400/80 lg:to-indigo-700/80
          "
        >
          {/* ===== 上部エリア(現在の天気 + 時間予報) ===== */}
          <div className="flex flex-col gap-6 p-4 pt-6 pb-8 ">
            <CurrentWeatherCard
              cityName={data.location.name}
              temp={current.temp_c}
              description={current.condition.text}
              iconUrl={current.condition.icon}
              humidity={current.humidity}
              windSpeed={windSpeedMs}
              maxTemp={todayForecast.maxtemp_c}
              minTemp={todayForecast.mintemp_c}
              precipitation={todayForecast.daily_chance_of_rain}
              localtime={data.location.localtime}
              onCitySubmit={onSearch}
              isSearching={isSearching}
            />

            <HourlyForecast items={forecastDays} currentHourKey={currentHourKey} />
          </div>

          {/* ===== 下部エリア(7日間の天気予報) ===== */}
          <DailyForecast items={forecastDays} />
        </div>
      </main>

      {/* フッター（PC・タブレット用）: スマホ版は別個Dailyに埋め込み */}
      <AppFooter className="text-slate-200 hidden sm:block" />
    </div>
  );
};

// "YYYY-MM-DD HH:MM" → "YYYY-MM-DD HH:00"
// HourlyでNowを光らせる準備
function makeCurrentHourKeyFromLocaltime(localtime: string) {
  const [datePart, timePart] = localtime.split(" ");
  const hour = timePart?.slice(0, 2) ?? "00";
  return `${datePart} ${hour}:00`;
}
