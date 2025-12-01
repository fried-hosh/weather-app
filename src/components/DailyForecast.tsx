import { useState, useEffect, useRef } from "react";
import AppFooter from "./AppFootre";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // シートを開閉する関数
  const toggleSheet = () => {
    setIsExpanded(!isExpanded);
  };

  // タッチ開始
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  // タッチ終了（スワイプ判定）
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientY;
    const distance = touchStart - touchEnd;
    const threshold = 50; // スワイプとみなす距離(px)

    // 上にスワイプ（distance > 0）: 開く
    if (distance > threshold && !isExpanded) {
      setIsExpanded(true);
    }

    // 下にスワイプ（distaice < 0）: 閉じる
    else if (distance < -threshold && isExpanded) {
      // NOTE:
      //   現状はsection全体にスワイプ判定を付けているため、
      //   Dailyが縦長になったときに「中身をスクロールしたつもり」が
      //   シートを閉じる操作として扱われてしまう可能性がある。
      // TODO:
      //   将来的には、内部スクロールがscrollTop === 0のときだけ閉じる判定を行うか、
      //   ハンドル周辺部にのみ閉じる判定を入れるのが理想。
      setIsExpanded(false);
    }

    // 状態をリセット
    setTouchStart(null);
  };

  // シートが閉じたらリストのスクロールをリセットする
  useEffect(() => {
    if (!isExpanded && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [isExpanded]);

  // シートが開いている間は、裏側のbodyスクロールを止める
  useEffect(() => {
    if (!isExpanded) {
      // 閉じているときは何もしない
      return;
    }
    // 画面幅が640px以上(sm)なら何もしない
    if (window.innerWidth >= 640) return;

    // リセット用のoverflow設定をコピーしておく
    const originalOverflow = document.body.style.overflow;
    // bodyのスクロールを無効化
    document.body.style.overflow = "hidden";

    // シートを閉じたとき・コンポーネントがアンマウントされたときに元に戻す
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isExpanded]);

  return (
    <section
      aria-labelledby="daily-forecast-title"
      className={`
        flex flex-col fixed bottom-0 left-0 right-0 z-10 rounded-t-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] h-[85dvh] bg-white

        ${isExpanded ? "translate-y-0" : "translate-y-[60dvh]"}

        sm:static sm:h-auto sm:translate-y-0 sm:m-0 sm:rounded-3xl
        lg:shadow-lg lg:backdrop-blur-md lg:bg-gradient-to-tl lg:from-blue-400 lg:to-blue-950 lg:mt-6
    `}
    >
      {/* ハンドルバー */}
      <div onClick={toggleSheet} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="flex w-full flex-col items-center justify-center pb-2 pt-4 sm:cursor-auto">
        <div className="mt-1 h-1.5 w-12 rounded-full bg-slate-400 sm:hidden" />

        <h2 id="daily-forecast-title" className="pt-2 pb-2 text-center text-lg font-bold text-slate-700 lg:text-slate-100">
          7日間の天気
        </h2>
      </div>

      {/* リスト（スクロール可能エリア） */}
      {/* ここにAPI入れる */}
      <div
        ref={listRef}
        id="daily-forecast-list"
        role="list"
        className="flex-1 overflow-y-auto px-6 pb-8 md:p-4 md:overflow-visible"
        // スマホで閉じてる時はスクロールさせない（誤操作防止）
        style={{ overflowY: isExpanded ? "auto" : "hidden" }}
      >
        <div className="flex flex-col md:gap-3 md:divide-y-0">
          {dummyDaily.map((item) => (
            <div key={item.day} className="flex items-center rounded-xl border border-blue-300 bg-slate-300 mb-1 px-4 py-2 shadow-md" role="listitem">
              {/* 曜日 */}
              <p className="w-12 font-semibold text-slate-700">{item.day}</p>
              {/* 天気アイコン */}
              {item.iconUrl ? <img className="size-10 rounded-full" src={item.iconUrl} alt={item.description ?? ""} /> : <div className="size-10 rounded-full bg-slate-200" aria-hidden />}
              {/* 気温 */}
              <p className="w-14 text-right text-slate-700">{item.temp}</p>
              {/* 説明 */}
              <p className="flex-1 text-right text-sm text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
        <AppFooter className="sm:hidden pt-1 text-slate-600" />
      </div>
    </section>
  );
};
export default DailyForecast;
