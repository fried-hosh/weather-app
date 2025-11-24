type CurrentWeatherCardProps = {
  cityName?: string;
  temperature?: string;
  description?: string;
  iconUrl?: string;
};

const CurrentWeatherCard = ({ cityName = "都市名", temperature = "20℃", description = "晴れ", iconUrl }: CurrentWeatherCardProps) => {
  return (
    <section aria-labelledby="current-weather-title" className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-700 dark:bg-slate-900/60">
      {/* 見出し */}
      <header className="mb-2 flex items-center justify-between">
        <h2 id="current-weather-title" className="text-lg font-semibold">
          {cityName}
        </h2>
      </header>

      {/* アイコン + 温度 + 説明 */}
      <div className="flex items-center gap-4">
        {iconUrl ? <img className="h-16 w-16" src={iconUrl} alt={description || ""} /> : <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden />}
        <div className="min-w-0 flex-1">
          <p className="text-5xl font-bold leading-none" aria-live="polite">
            {temperature}
          </p>
          <p className="mt-1 truncate text-2xl text-slate-600 dark:text-slate-300">{description}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 text-lg text-slate-600 dark:text-slate-300">
        {/* 最高・最低気温 */}
        <div className="space-y-1">
          <p>
            <span className="text-slate-500 dark:text-slate-300">最高気温 : </span>
            <span className="font-medium">--℃</span>
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-300"> 最低気温 : </span>
            <span className="font-medium">--℃</span>
          </p>
        </div>

        {/* 湿度・風速・降水確率 */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500 dark:text-slate-300">湿度</span>
            <p className="font-medium">--%</p>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500 dark:text-slate-300">風速</span>
            <p className="font-medium">--m/s</p>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500 dark:text-slate-300">降水確率</span>
            <p className="font-medium">--%</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentWeatherCard;
