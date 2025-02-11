import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherCard, WeatherMetric } from "@/components/weather/WeatherCard";
import { WeatherChart } from "@/components/weather/WeatherChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  windDir: number;
  hourlyrainin: number;
  dailyrainin: number;
  weeklyrainin: number;
  monthlyrainin: number;
  feelsLike: number;
  dewPoint: number;
  lastRain: string;
};

export default function Weather() {
  const { data, isLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden p-6">
        <div className="flex-none">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 overflow-auto mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = data ? [
    {
      label: "Temperature",
      value: data.temperature,
      unit: "°F",
      icon: "temperature" as const
    },
    {
      label: "Feels Like",
      value: data.feelsLike,
      unit: "°F",
      icon: "temperature" as const
    },
    {
      label: "Humidity",
      value: data.humidity,
      unit: "%",
      icon: "humidity" as const
    },
    {
      label: "Wind Speed",
      value: data.windSpeed,
      unit: "mph",
      icon: "wind" as const
    },
    {
      label: "Pressure",
      value: data.pressure,
      unit: "inHg",
      icon: "pressure" as const
    },
    {
      label: "Dew Point",
      value: data.dewPoint,
      unit: "°F",
      icon: "temperature" as const
    }
  ] : [];

  const precipitationMetrics = data ? [
    {
      label: "Hourly Rain",
      value: data.hourlyrainin,
      unit: "in",
      icon: "rain" as const
    },
    {
      label: "Daily Rain",
      value: data.dailyrainin,
      unit: "in",
      icon: "rain" as const
    },
    {
      label: "Weekly Rain",
      value: data.weeklyrainin,
      unit: "in",
      icon: "rain" as const
    },
    {
      label: "Monthly Rain",
      value: data.monthlyrainin,
      unit: "in",
      icon: "rain" as const
    }
  ] : [];

  return (
    <div className="h-screen flex flex-col overflow-hidden p-6">
      {/* Header section - fixed */}
      <div className="flex-none space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">How's the weather?</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Tabs section */}
      <Tabs defaultValue="current" className="flex-1 flex flex-col overflow-hidden mt-8">
        <div className="flex-none">
          <TabsList>
            <TabsTrigger value="current">Current Conditions</TabsTrigger>
            <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
          </TabsList>
        </div>

        {/* Content section - scrollable */}
        <div className="flex-1 overflow-auto no-scrollbar mt-8">
          <TabsContent value="current" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <WeatherCard key={metric.label} metric={metric as WeatherMetric} />
              ))}
            </div>
            {/* <WeatherChart type="temperature" /> */}
          </TabsContent>

          <TabsContent value="precipitation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {precipitationMetrics.map((metric) => (
                <WeatherCard key={metric.label} metric={metric as WeatherMetric} />
              ))}
            </div>
            {/* <WeatherChart type="precipitation" /> */}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}