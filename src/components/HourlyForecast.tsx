import { useEffect, useRef } from "react";
import type { ForecastDay } from "../hooks/useWeather";

type HourlyItem = {
  time: string;
  temp: number;
  iconUrl?: string;
  description: string;
  // Now判定用
  fullTime: string;
  // "00:00"の色変え
  isMidnight: boolean;
};

type HourlyForecastProps = {
  items: ForecastDay[];
  currentHourKey: string;
};

/* ========================================
   データ整形（全日分のhour -> 表示用のHourlyItem）
======================================== */

const HourlyForecast = ({ items, currentHourKey }: HourlyForecastProps) => {
  // 全日分のhourをフラットにする
  const allHours = items.flatMap((day) => day.hour);

  const data: HourlyItem[] = allHours.map((h) => {
    // h.time: "YYYY-MM-DD hh:mm"を文字列として分解する
    const [datePart, timePart] = h.time.split(" ");
    // "hh:mm"の部分のみを時間表記に利用
    const timeLabel = timePart;
    const isMidnight = timeLabel === "00:00";

    // 0時だけ日付(M/D)にする
    let displayLabel = timeLabel;
    if (isMidnight) {
      const [, m, d] = datePart.split("-");
      displayLabel = `${Number(m)}/${Number(d)}`;
    }

    return {
      time: displayLabel,
      temp: Math.round(h.temp_c),
      iconUrl: h.condition.icon,
      description: h.condition.text,
      fullTime: h.time,
      isMidnight,
    };
  });

  /* ========================================
   参照（スクロール領域・Nowカード）
======================================== */

  // スクロール要素への参照を作成
  const scrollRef = useRef<HTMLDivElement>(null);

  // Nowカードへの参照
  const nowCardRef = useRef<HTMLDivElement>(null);

  /* ========================================
   イベント（左右スクロールボタン）
======================================== */

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

  /* ========================================
   副作用（Nowカードまで自動スクロール）
======================================== */

  useEffect(() => {
    // Hourlyのカード全体
    const container = scrollRef.current;
    // Nowカード
    const nowCard = nowCardRef.current;
    if (!container || !nowCard) return;

    // リストの先頭(スクロール込みで左端のカード)からNowカードまでの距離px
    const cardLeft = nowCard.offsetLeft;
    // Nowカード自体の横幅px
    const cardWidth = nowCard.offsetWidth;
    // Hourlyリストの横幅px
    const containerWidth = container.clientWidth;

    // カードがおおよそ中央にくるようにスクロール位置を調整
    // (containerWidth - cardWidth) / 2 ... カードをコンテナの真ん中に置いて二等分したときの片方の余白の長さ。
    // cardLeft ... リストの先頭〜Nowカードまでの距離。ただこの距離自体は画面(コンテナ)の左端までの距離だから、
    // Nowカードをコンテナの真ん中あたりにちゃんと置くために片方の余白の長さを引く。
    // そうするとNowカードがコンテナの半分くらいの位置に表示される。(= 余白のpx分左側の地点がコンテナの左端になる)
    const targetScrollLeft = cardLeft - (containerWidth - cardWidth) / 2;

    // スクロールバーを指定した位置pxまで移動させる。0は左端。
    // ブラウザは「左端」しか見ることができないから、「左端に何を置くか」を指定する必要がある。
    // scrollTo left:は「リストの何px地点を画面の左端にするか」を決めるメソッド。
    container.scrollTo({
      // Nowが0時(リストの左端)の場合、targetScrollLeftが負になってバグるから0を置いておく。
      left: Math.max(targetScrollLeft, 0),
      behavior: "smooth",
    });
  }, [items]);

  /* ========================================
   UI
======================================== */

  return (
    // 親にgroup、子にgroup-hover:⚪︎⚪︎で、「親がhoverされたときに子の見た目を変える」。
    <section
      className="
      group relative w-full
      lg:rounded-3xl lg:bg-white/10 lg:p-6 lg:backdrop-blur-sm lg:shadow-lg lg:border-2 lg:border-white/10 lg:mt-auto
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
        {data.map((item) => {
          // Now判定。fullTime(YYYY-MM-DD hh:mm)の先頭文字がcurrentHourKey(YYYY-MM-DD hh)と一致してるならNowと表示。
          const isNow = item.fullTime.startsWith(currentHourKey);

          return (
            <div
              ref={isNow ? nowCardRef : undefined}
              key={item.fullTime}
              role="listitem"
              className={`flex min-w-[4.5rem] shrink-0 snap-start flex-col items-center justify-between gap-2 rounded-2xl border shadow-sm backdrop-blur transition-colors
          ${isNow ? "border-slate-200 bg-white/40 text-slate-600 lg:bg-blue-400/60" : "bg-white/10 text-slate-100"} `}
            >
              {/* 時間 */}
              <p className={`pt-2 text-xs font-semibold lg:text-base ${item.isMidnight ? "text-slate-600" : ""}`}>{isNow ? "Now" : item.time}</p>

              {/* アイコン */}
              {item.iconUrl ? <img className="size-8 " src={item.iconUrl} alt={item.description ?? ""} /> : <div className="size-8 rounded-full bg-slate-200/50 dark:bg-slate-600/50" aria-hidden />}

              {/* 気温 */}
              <p className="pb-2 text-sm font-bold lg:text-lg">{`${item.temp}℃`}</p>
            </div>
          );
        })}
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
