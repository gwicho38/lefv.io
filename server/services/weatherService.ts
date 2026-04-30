import { logError, logInfo } from '../utils/logger';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  windDir: number;
  hourlyrainin?: number;
  dailyrainin?: number;
  weeklyrainin?: number;
  monthlyrainin?: number;
  feelsLike: number;
  dewPoint?: number;
  lastRain?: string | null;
  description?: string;
  city?: string;
  country?: string;
  source: 'ambient' | 'openweather';
}

class WeatherService {
  private ambientApiKey?: string;
  private ambientAppKey?: string;
  private ambientMacAddress?: string;
  private openWeatherApiKey?: string;
  private openWeatherCity?: string;
  private openWeatherCountry?: string;

  constructor() {
    this.ambientApiKey = process.env.AMBIENT_API_KEY;
    this.ambientAppKey = process.env.AMBIENT_APP_KEY;
    this.ambientMacAddress = process.env.AMBIENT_MAC_ADDRESS;
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
    this.openWeatherCity = process.env.OPENWEATHER_CITY || 'Paris';
    this.openWeatherCountry = process.env.OPENWEATHER_COUNTRY || 'FR';
  }

  async getCurrentWeather(): Promise<WeatherData> {
    // Try Ambient Weather first if configured
    if (this.isAmbientConfigured()) {
      try {
        const ambientData = await this.getAmbientWeather();
        if (ambientData) {
          return ambientData;
        }
      } catch (error) {
        logError('Ambient Weather API failed, falling back to OpenWeatherMap', error);
      }
    }

    // Fall back to OpenWeatherMap
    if (this.isOpenWeatherConfigured()) {
      try {
        const openWeatherData = await this.getOpenWeatherMapData();
        return openWeatherData;
      } catch (error) {
        logError('OpenWeatherMap API failed', error);
        throw new Error('All weather services failed');
      }
    }

    throw new Error('No weather service configured');
  }

  private isAmbientConfigured(): boolean {
    return !!(this.ambientApiKey && this.ambientAppKey);
  }

  private isOpenWeatherConfigured(): boolean {
    return !!this.openWeatherApiKey;
  }

  private async getAmbientWeather(): Promise<WeatherData | null> {
    const params = new URLSearchParams({
      apiKey: this.ambientApiKey!,
      applicationKey: this.ambientAppKey!
    });

    const response = await fetch(
      `https://api.ambientweather.net/v1/devices?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Ambient Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const lastData = data[0]?.lastData;

    if (!lastData) {
      return null;
    }

    logInfo('Weather data fetched from Ambient Weather station');

    return {
      temperature: lastData.tempf || 0,
      humidity: lastData.humidity || 0,
      windSpeed: lastData.windspeedmph || 0,
      pressure: lastData.baromrelin || 0,
      windDir: lastData.winddir || 0,
      hourlyrainin: lastData.hourlyrainin || 0,
      dailyrainin: lastData.dailyrainin || 0,
      weeklyrainin: lastData.weeklyrainin || 0,
      monthlyrainin: lastData.monthlyrainin || 0,
      feelsLike: lastData.feelsLike || lastData.tempf || 0,
      dewPoint: lastData.dewPoint || 0,
      lastRain: lastData.lastRain || null,
      source: 'ambient'
    };
  }

  private async getOpenWeatherMapData(): Promise<WeatherData> {
    const params = new URLSearchParams({
      q: `${this.openWeatherCity},${this.openWeatherCountry}`,
      appid: this.openWeatherApiKey!,
      units: 'imperial' // Use imperial units to match Ambient Weather
    });

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();

    logInfo('Weather data fetched from OpenWeatherMap', {
      city: data.name,
      country: data.sys.country
    });

    return {
      temperature: data.main.temp || 0,
      humidity: data.main.humidity || 0,
      windSpeed: data.wind.speed || 0,
      pressure: data.main.pressure * 0.02953 || 0, // Convert hPa to inHg
      windDir: data.wind.deg || 0,
      feelsLike: data.main.feels_like || data.main.temp || 0,
      description: data.weather[0]?.description,
      city: data.name,
      country: data.sys.country,
      source: 'openweather'
    };
  }

  async getWeatherHistory(type: 'temperature' | 'precipitation'): Promise<any> {
    // For now, only Ambient Weather supports history
    if (!this.isAmbientConfigured() || !this.ambientMacAddress) {
      throw new Error('Weather history only available with Ambient Weather station');
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

    const params = new URLSearchParams({
      apiKey: this.ambientApiKey!,
      applicationKey: this.ambientAppKey!,
      endDate: endDate.toISOString(),
      startDate: startDate.toISOString()
    });

    const response = await fetch(
      `https://api.ambientweather.net/v1/devices/${this.ambientMacAddress}/data?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Weather history API error: ${response.status}`);
    }

    const data = await response.json();

    if (type === 'temperature') {
      return data.map((item: any) => ({
        time: item.date,
        value: item.tempf || 0
      }));
    } else {
      return data.map((item: any) => ({
        time: item.date,
        hourly: item.hourlyrainin || 0,
        daily: item.dailyrainin || 0
      }));
    }
  }
}

export const weatherService = new WeatherService();