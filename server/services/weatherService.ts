import { logError, logInfo } from '../utils/logger';
import { WeatherService } from '../../lib/weather';

export type { WeatherConfig, WeatherData } from '../../lib/weather';
export { WeatherService } from '../../lib/weather';

export const weatherService = new WeatherService(
  () => ({
    ambientApiKey: process.env.AMBIENT_API_KEY,
    ambientAppKey: process.env.AMBIENT_APP_KEY,
    ambientMacAddress: process.env.AMBIENT_MAC_ADDRESS,
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
    openWeatherCity: process.env.OPENWEATHER_CITY,
    openWeatherCountry: process.env.OPENWEATHER_COUNTRY,
  }),
  { info: logInfo, error: logError },
);
