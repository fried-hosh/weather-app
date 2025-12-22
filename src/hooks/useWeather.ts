import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const WeatherSchema = z.object({
  //Current
  location: z.object({
    name: z.string(),
    localtime: z.string(),
  }),
  current: z.object({
    temp_c: z.coerce.number(),
    condition: z.object({
      text: z.string(),
      icon: z.string(),
    }),
    humidity: z.coerce.number(),
    wind_kph: z.coerce.number(),
  }),
  forecast: z.object({
    forecastday: z.array(
      z.object({
        // Daily
        date: z.string(),
        day: z.object({
          maxtemp_c: z.coerce.number(),
          mintemp_c: z.coerce.number(),
          daily_chance_of_rain: z.coerce.number(),
          condition: z.object({
            text: z.string(),
            icon: z.string(),
          }),
        }),
        // Hourly
        hour: z.array(
          z.object({
            time: z.string(),
            temp_c: z.coerce.number(),
            condition: z.object({
              text: z.string(),
              icon: z.string(),
            }),
          })
        ),
      })
    ),
  }),
});

export type WeatherApiResponse = z.infer<typeof WeatherSchema>;

// Hourly / DailyForecast.tsx用
export type ForecastDay = WeatherApiResponse["forecast"]["forecastday"][number];

export const fetchWeather = async (city: string): Promise<WeatherApiResponse> => {
  try {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

    if (!res.ok) {
      if (res.status === 400 || res.status === 404) {
        throw new Error("指定した都市が見つかりませんでした。\nスペルを確認してください。");
      }
      if (res.status === 429) {
        throw new Error("アクセスが集中しています。\nしばらく時間をおいて再試行してください。");
      }
      throw new Error("天気データの取得に失敗しました。\nしばらく時間をおいて再試行してください。");
    }

    const data: unknown = await res.json();
    if (import.meta.env.DEV) {
      console.log(data);
    }
    const validatedData = WeatherSchema.safeParse(data);

    if (!validatedData.success) {
      const msg = validatedData.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
      console.error(`バリデーションエラー: ${msg}`);
      throw new Error("天気データの取得に失敗しました。\nしばらく時間をおいて再試行してください。");
    } else {
      return validatedData.data;
    }
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("予期しないエラーが発生しました。");
  }
};

export const useWeather = (city: string) => {
  return useQuery({
    queryKey: ["weather", city],
    queryFn: () => fetchWeather(city),
    // 別タブから戻ってきたときにデータを再取得するかどうか
    refetchOnWindowFocus: false,
  });
};
