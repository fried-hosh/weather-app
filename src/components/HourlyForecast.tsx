import { useRef } from "react";

type HourlyItem = {
  time: string;
  temp: string;
  iconUrl?: string;
  description?: string;
};

const dummyHourly: HourlyItem[] = [
  { time: "12:00", temp: "20℃", description: "くもり" },
  { time: "13:00", temp: "21℃", description: "くもり時々晴れ" },
  { time: "14:00", temp: "22℃", description: "晴れ" },
  { time: "15:00", temp: "23℃", description: "晴れ" },
  { time: "16:00", temp: "21℃", description: "くもり" },
  { time: "17:00", temp: "19℃", description: "雨" },
  { time: "18:00", temp: "18℃", description: "雨" },
  { time: "19:00", temp: "17℃", description: "雨" },
  { time: "20:00", temp: "16℃", description: "雨" },
  { time: "21:00", temp: "15℃", description: "雨" },
  { time: "22:00", temp: "14℃", description: "雨" },
];

const HourlyForecast = () => {
  // スクロール要素への参照を作成
  const scrollRef = useRef<HTMLDivElement>(null);

  // スクロール操作の関数
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // スクロール量( scrollByのleft: で120なら120px動く)
      const scrollAmount = 240;

      if (direction === "left") {
        // scrollByのleft: は「横方向」を表すプロパティ。他の"left"とは別物。
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    // 親にgroup、子にgroup-hover:⚪︎⚪︎で、「親がhoverされたときに子の見た目を変える」。
    <section
      className="
      group relative w-full
      lg:rounded-3xl lg:bg-black/10 lg:p-6 lg:backdrop-blur-sm lg:shadow-md
      "
      aria-labelledby="hourly-forecast-title"
    >
      {/* 読み上げ用 表示しない */}
      <h2 className="sr-only" id="hourly-forecast-title">
        1時間ごとの予報
      </h2>

      {/* === 左スクロールボタン === */}
      {/* sm: は「640px以上」。max-w-smとはサイズが異なる。 */}
      <button
        onClick={() => scroll("left")}
        className="
        absolute left-0 top-1/2 z-10 -translate-x-2 -translate-y-1/2 rounded-full bg-white/60 p-1 opacity-0 shadow-md backdrop-blur transition-opacity hover:bg-white sm:group-hover:opacity-100
        dark:bg-slate-800/80 dark:hover:bg-slate-700
        "
        aria-label="前の時間へ移動"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-slate-600 dark:text-slate-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* === 横スクロールリスト === */}
      {/* ref={scrollRef}でリストのDOMをuseRef.currentに保存して操作する */}
      <div ref={scrollRef} className="no-scrollbar flex w-full snap-x gap-3 overflow-x-auto scroll-smooth px-1 " role="list">
        {/* ここにAPI入れる */}
        {dummyHourly.map((item, index) => (
          <div
            key={item.time}
            role="listitem"
            className={`flex min-w-[4.5rem] shrink-0 snap-start flex-col items-center justify-between gap-2 rounded-2xl border shadow-sm backdrop-blur transition-colors
          ${
            /* 「Now」など特定の要素を目立たせる場合の条件分岐例（今回はindex=0をハイライト） */
            index === 0 ? "border-slate-200 bg-white/30 text-slate-600" : "border-blue-200 bg-blue-950/20 text-slate-100"
          } `}
          >
            {/* 時間 */}
            <p className="pt-2 text-xs font-semibold lg:text-base">{item.time}</p>

            {/* アイコン */}
            {item.iconUrl ? <img className="size-8 " src={item.iconUrl} alt={item.description ?? ""} /> : <div className="size-8 rounded-full bg-slate-200/50 dark:bg-slate-600/50" aria-hidden />}

            {/* 気温 */}
            <p className="pb-2 text-sm font-bold lg:text-lg">{item.temp}</p>
          </div>
        ))}
      </div>

      {/* === 右スクロールボタン === */}
      <button
        onClick={() => scroll("right")}
        className="
      absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full bg-white/60 p-1 opacity-0 shadow-md backdrop-blur transition-opacity hover:bg-white sm:group-hover:opacity-100
      dark:bg-slate-800/80 dark:hover:bg-slate-700
      "
        aria-label="次の時間へ移動"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-slate-600 dark:text-slate-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </section>
  );
};

export default HourlyForecast;
