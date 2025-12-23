import { useEffect, useState } from "react";

type CurrentWeatherCardProps = {
  cityName: string;
  temp: number;
  description: string;
  iconUrl: string;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  localtime: string;
  // 送信用の関数
  onCitySubmit: (city: string) => Promise<boolean>;
  // 送信中にぐるぐるボタン
  isSearching: boolean;
};

/* ========================================
   データ整形
======================================== */

const CurrentWeatherCard = ({ cityName, temp, description, iconUrl, maxTemp, minTemp, humidity, windSpeed, precipitation, localtime, onCitySubmit, isSearching = false }: CurrentWeatherCardProps) => {
  const displayTemp = `${Math.round(temp)}℃`;
  const displayMax = `${Math.round(maxTemp)}℃`;
  const displayMin = `${Math.round(minTemp)}℃`;
  const displayHumidity = `${humidity}%`;
  const displayWind = `${Math.round(windSpeed)}m/s`;
  const displayRain = `${precipitation}%`;

  /* ========================================
   状態
======================================== */

  const [isEditing, setIsEditing] = useState(false);
  const [draftCity, setDraftCity] = useState(cityName);

  /* ========================================
   副作用（都市名の変更を入力欄に同期）
======================================== */

  // 入力欄(draftCity)は自分でsetDraftCityしない限り変わらない。
  // 都市お気に入りボタン等で表示の都市名(cityName)だけ変わったとき、編集欄が古いdraftCityにならないようにcityNameに合わせて更新する。
  useEffect(() => {
    setDraftCity(cityName);
  }, [cityName]);

  // 日付の整形: "YYYY-MM-DD HH:mm" -> ⚪︎⚪︎月××日(金曜日)
  // 安定表示用に日付と時間の区切りをTに置換
  const dateObj = new Date(localtime.replace(" ", "T"));
  // ⚪︎⚪︎月××日
  const dateStr = new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
  }).format(dateObj);
  // (金曜日)
  const weekStr = new Intl.DateTimeFormat("ja-JP", {
    weekday: "long",
  }).format(dateObj);

  const displayDate = `${dateStr}(${weekStr})`;

  /* ========================================
   イベント（編集の送信・キャンセル）
======================================== */

  // 編集内容(都市名)を送信
  const submitEdit = async () => {
    const next = draftCity;
    if (!next) return;
    // 成否を受け取る
    const ok = await onCitySubmit(next);
    // 成功したときだけ閉じる
    if (ok) setIsEditing(false);
  };

  // 編集をキャンセル
  const cancelEdit = () => {
    setDraftCity(cityName);
    setIsEditing(false);
  };

  /* ========================================
   UI
======================================== */

  return (
    <section aria-labelledby="current-weather-title" className="rounded-3xl border-2 border-white/10 p-6 text-white shadow-lg backdrop-blur-md bg-white/10">
      {/* 見出し */}
      <header className="mb-4 flex items-center justify-between">
        {isEditing ? (
          // === 編集モード ===
          <div className="flex w-full items-center gap-2">
            <input
              className="w-full rounded-xl bg-white/15 px-3 py-2 text-3xl font-semibold text-white placeholder:text-white/60 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/40 lg:text-2xl"
              value={draftCity}
              onChange={(e) => setDraftCity(e.target.value)}
              placeholder="都市名を入力"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSearching) submitEdit();
                if (e.key === "Escape") cancelEdit();
              }}
            />

            <button type="button" aria-label="決定" className="inline-flex size-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:bg-white/35" disabled={isSearching} onClick={submitEdit}>
              {/* 送信ボタン */}
              {isSearching ? (
                // 🌀マーク
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-3-6.7" />
                </svg>
              ) : (
                // ✅ボタン
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>

            <button type="button" aria-label="キャンセル" className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25" onClick={cancelEdit}>
              {/* ❌ボタン */}
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          // === 表示モード(非編集時) ===
          <div className="flex w-full items-center justify-between">
            <div>
              <h2 id="current-weather-title" className="text-4xl font-semibold drop-shadow-sm lg:text-3xl cursor-pointer" onClick={() => setIsEditing(true)}>
                {cityName}
              </h2>
              <p className="mt-1 text-base font-medium text-white/95">{displayDate}</p>
            </div>
            {/* 編集ボタン */}
            <button type="button" aria-label="都市名を変更" className="ml-2 inline-flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-md" onClick={() => setIsEditing(true)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/90" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </button>
          </div>
        )}
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
            <span className="font-medium">{displayMax}</span>
          </p>
          <p className="flex items-baseline justify-between pr-4">
            <span>最低気温</span>
            <span className="font-medium">{displayMin}</span>
          </p>
        </div>

        {/* 湿度・風速・降水確率 */}
        <div className="space-y-1 text-slate-100">
          <div className="flex items-baseline justify-between pr-4">
            <span className="">湿度</span>
            <p className="font-medium">{displayHumidity}</p>
          </div>
          <div className="flex items-baseline justify-between pr-4">
            <span className="">風速</span>
            <p className="font-medium">{displayWind}</p>
          </div>
          <div className="flex items-baseline justify-between pr-4">
            <span className="">降水確率</span>
            <p className="font-medium">{displayRain}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentWeatherCard;
