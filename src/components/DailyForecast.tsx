type DailyItem = {
  day: string;
  iconUrl?: string;
  temp: string;
  description?: string;
};

const dummyDaily: DailyItem[] = [
  { day: "Mon", temp: "26℃", description: "Partly Cloudy" },
  { day: "Tue", temp: "24℃", description: "Showers" },
  { day: "Wed", temp: "26℃", description: "Mostly Sunny" },
  { day: "Thu", temp: "23℃", description: "Light Rain" },
  { day: "Fri", temp: "28℃", description: "Sunny" },
  { day: "Sat", temp: "26℃", description: "Partly Cloudy" },
  { day: "Sun", temp: "22℃", description: "Rain Likely" },
];

const DailyForecast = () => {
  return (
    <section aria-labelledby="daily-forecast-title" className="px-4 py-3">
      <h2 id="daily-forecast-title">7日間の天気</h2>

      {/* ここにAPI入れる */}
      <div id="daily-forecast-list" role="list" className="flex flex-col gap-3">
        {dummyDaily.map((item) => (
          <div key={item.day} className="flex items-center rounded-xl bg-white/80 px-4 py-3" role="listitem">
            {/* 曜日 */}
            <p className="w-12 font-semibold">{item.day}</p>
            {/* 天気アイコン */}
            {item.iconUrl ? <img className="h-8 w-8 rounded-full" src={item.iconUrl} alt={item.description ?? ""} /> : <div className="h-8 w-8 rounded-full bg-slate-200" aria-hidden />}
            {/* 気温 */}
            <p className="w-14 text-right">{item.temp}</p>
            {/* 説明 */}
            <p className="flex-1 text-right text-sm text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DailyForecast;
