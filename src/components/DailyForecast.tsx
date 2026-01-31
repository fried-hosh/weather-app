import { useState, useEffect, useRef } from "react";
import AppFooter from "./AppFooter";
import type { ForecastDay } from "../hooks/useWeather";

type DailyItem = {
  day: string;
  iconUrl?: string;
  temp: number;
  description: string;
  date: string;
};

type DailyForecastProps = {
  items: ForecastDay[];
};

/* ========================================
   データ整形
======================================== */

// Dateを渡すと日本語で曜日を返すフォーマッタを作成("short"だと"日","月"...)
const dayFormatter = new Intl.DateTimeFormat("ja-JP", { weekday: "short" });

const DailyForecast = ({ items }: DailyForecastProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  // スワイプ成立直後、シートに互換clickが来た場合に、そのclickを1回だけ無視するためのフラグ
  // UIと関係ない制御フラグのためrefで保持
  const ignoreClickRef = useRef(false);

  const data: DailyItem[] = items.map((d) => {
    // new Date("YYYY-MM-DD")はUTCの0時に変換される。
    // その結果、UTC-の地域(アメリカ等)の端末では、検索都市が常に前日と表示されてしまう。
    // 解決策: 後ろに "T00:00:00"(時刻) をつけると、「その端末における0時」として解釈されるため、ズレが発生しない。
    const forecastDate = new Date(`${d.date}T00:00:00`);
    // forecastDateの日時を見て、その日の西暦上の曜日を返す。
    const weekday = dayFormatter.format(forecastDate);

    // 1日分のAPIデータを、表示用の形(DailyItem)に変換して返す
    return {
      day: weekday,
      iconUrl: `https:${d.day.condition.icon}`,
      // とりあえず最高気温のみ
      temp: Math.round(d.day.maxtemp_c),
      description: d.day.condition.text,
      // key用
      date: d.date,
    };
  });

  /* ========================================
   イベント（クリック・スワイプで開閉）
======================================== */

  const toggleSheet = () => {
    // スワイプとクリック同時発火によるシート反転事故防止
    // 直前にスワイプが成立して「次にclickを無視する」状態なら、そのclickは処理せず、フラグだけ戻して終わる。
    if (ignoreClickRef.current) {
      ignoreClickRef.current = false;
      return;
    }

    setIsExpanded((prev) => !prev);
  };

  // タッチ開始
  const handleTouchStart = (e: React.TouchEvent) => {
    // タッチ操作が始まった時点で無視フラグをリセット
    ignoreClickRef.current = false;

    touchStartRef.current = e.targetTouches[0].clientY;
  };

  // タッチ終了（スワイプ判定）
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;

    const touchEnd = e.changedTouches[0].clientY;
    const distance = touchStartRef.current - touchEnd;
    const threshold = 50; // スワイプとみなす距離(px)

    // 上にスワイプ（distance > 0）: 開く
    if (distance > threshold && !isExpanded) {
      // このスワイプ操作の直後に互換clickが飛んできたら、それを1回無視したい
      // スワイプ成功時にのみtrueにするため、
      // タップはtouchStart(false)->End(変わらない)->click(false)の流れでクリック無効化されずに実行できる。
      ignoreClickRef.current = true;

      setIsExpanded(true);
    }

    // 下にスワイプ（distaice < 0）: 閉じる
    else if (distance < -threshold && isExpanded) {
      ignoreClickRef.current = true;

      setIsExpanded(false);
    }

    // 状態をリセット
    touchStartRef.current = null;
  };

  /* ========================================
   副作用（スクロール・画面幅・bodyロック）
======================================== */

  // シートが閉じたらリストのスクロールをリセットする
  useEffect(() => {
    if (!isExpanded && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [isExpanded]);

  // sm(640px)以上になったら強制的にシートを閉じる（横画面遷移でスクロール不可になるバグ対策）
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");

    const handleChange = (e: MediaQueryListEvent) => {
      // 640px以上になったら閉じる
      if (e.matches) {
        setIsExpanded(false);
      }
    };
    // イベントリスナーを登録
    mediaQuery.addEventListener("change", handleChange);
    // クリーンアップ
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // モバイル時にシートを開いた状態で横持ち（sm）にするとスクロール不能になるバグの解消
  // シートが開いてる間は、sm未満ならbodyをロック、sm以上なら解除
  useEffect(() => {
    // シートが閉じている間は何もしない = 閉じている間は普段通りbodyスクロール可能
    if (!isExpanded) return;

    // 解除用に「元のbodyのoverflow設定」を保存しておく。他ライブラリの設定等で特別な設定がされている可能性があるため。
    const originalOverflow = document.body.style.overflow;

    // 「画面が今モバイル(639px以下)かどうか」を判定するオブジェクト
    // .matchesで「条件を満たしているか」を真偽値で返せる。
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    // 現在の画面幅に応じてbodyのスクロールロックを判定する
    // - sm未満（matches=true）: bodyスクロールを止める
    // - sm以上（matches=false）: bodyスクロールを止めない（元のoverflowに戻す）
    const apply = () => {
      document.body.style.overflow = mediaQuery.matches ? "hidden" : originalOverflow;
    };

    // 初回（シートを開いたとき）にまず実行してロックするかを判定
    apply();

    // 境界線を跨いだら再判定
    mediaQuery.addEventListener("change", apply);
    // クリーンアップ
    return () => {
      mediaQuery.removeEventListener("change", apply);
      document.body.style.overflow = originalOverflow;
    };
  }, [isExpanded]);

  /* ========================================
   UI
======================================== */

  return (
    <section
      aria-labelledby="daily-forecast-title"
      className={`
        flex flex-col fixed bottom-0 left-0 right-0 z-10 rounded-t-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] h-[85dvh] bg-white

        ${isExpanded ? "translate-y-0" : "translate-y-[65dvh]"}

        sm:static sm:h-auto sm:translate-y-0 sm:m-0 sm:rounded-3xl sm:bg-white/10 sm:shadow-lg
        lg:shadow-lg lg:backdrop-blur-md lg:border-2 lg:border-white/10 lg:mt-6
    `}
    >
      {/* ハンドルバー */}
      <div onClick={toggleSheet} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="flex w-full flex-col items-center justify-center pb-2 pt-4 sm:cursor-auto">
        <div className="mt-1 h-1.5 w-12 rounded-full bg-slate-400 sm:hidden" />

        <h2 id="daily-forecast-title" className="pt-2 pb-2 text-center text-lg font-bold text-slate-700 sm:text-slate-100">
          {items.length}日間の天気
        </h2>
      </div>

      {/* リスト（スクロール可能エリア） */}
      <div
        ref={listRef}
        id="daily-forecast-list"
        role="list"
        // シートを閉じている間はリスト内スクロールさせない（誤操作防止）
        className={`flex-1 px-6 pb-8 md:p-4 sm:overflow-visible
          ${isExpanded ? "overflow-y-auto" : "overflow-hidden"}
          `}
      >
        <div className="flex flex-col md:gap-3 md:divide-y-0">
          {data.map((item) => (
            <div
              key={item.date}
              className="
                flex items-center rounded-xl border border-white/30 bg-slate-300 mb-1 px-4 py-2 shadow-md
                sm:bg-slate-200/50
                sm:bg-gradient-to-br sm:from-white/40 sm:to-white/5
                "
              role="listitem"
            >
              {/* 曜日 */}
              <p className="w-12 font-semibold text-slate-700 ">{item.day}</p>
              {/* 天気アイコン */}
              {item.iconUrl ? <img className="size-10 rounded-full" src={item.iconUrl} alt={item.description ?? ""} /> : <div className="size-10 rounded-full bg-slate-200" aria-hidden />}
              {/* 気温 */}
              <p className="w-14 text-right text-slate-600">{`${item.temp}℃`}</p>
              {/* 説明 */}
              <p className="flex-1 text-right text-sm text-slate-700">{`${item.description}`}</p>
            </div>
          ))}
        </div>
        <AppFooter className="sm:hidden pt-1 text-slate-600" />
      </div>
    </section>
  );
};
export default DailyForecast;
