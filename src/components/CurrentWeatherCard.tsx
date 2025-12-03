type CurrentWeatherCardProps = {
  cityName?: string;
  temp?: number;
  description?: string;
  iconUrl?: string;
};

const CurrentWeatherCard = ({ cityName = "都市名", temp, description = "晴れ", iconUrl }: CurrentWeatherCardProps) => {
  const displayTemp = temp !== undefined ? `${Math.round(temp)}℃` : "--℃";

  return (
    <section aria-labelledby="current-weather-title" className="rounded-3xl border-2 border-white/10 p-6 text-white shadow-lg backdrop-blur-md bg-white/10">
      {/* 見出し */}
      <header className="mb-4 flex items-center justify-between">
        <h2 id="current-weather-title" className="text-4xl font-semibold drop-shadow-sm lg:text-3xl">
          {cityName}
        </h2>
      </header>

      {/* アイコン + 温度 + 説明 */}
      <div className="flex items-center gap-4">
        {iconUrl ? <img className="size-20 drop-shadow-md" src={iconUrl} alt={description || ""} /> : <div className="size-20 rounded-full bg-white/20 backdrop-blur-sm" aria-hidden />}
        <div className="min-w-0 flex-1">
          <p className="text-6xl font-bold leading-none tracking-tight drop-shadow-sm lg:text-7xl" aria-live="polite">
            {displayTemp}
          </p>
          <p className="mt-1 truncate text-2xl font-medium text-slate-100 drop-shadow-sm">{description}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 text-lg">
        {/* 最高・最低気温 */}
        <div className="">
          <p className="flex items-baseline justify-between pr-4">
            <span>最高気温</span>
            <span className="font-medium">--℃</span>
          </p>
          <p className="flex items-baseline justify-between pr-4">
            <span>最低気温</span>
            <span className="font-medium">--℃</span>
          </p>
        </div>

        {/* 湿度・風速・降水確率 */}
        <div className="space-y-1 text-slate-100">
          <div className="flex items-baseline justify-between pr-4">
            <span className="">湿度</span>
            <p className="font-medium">--%</p>
          </div>
          <div className="flex items-baseline justify-between pr-4">
            <span className="">風速</span>
            <p className="font-medium">--m/s</p>
          </div>
          <div className="flex items-baseline justify-between pr-4">
            <span className="">降水確率</span>
            <p className="font-medium">--%</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentWeatherCard;
