
import { WeatherData } from '../types';

// WMO Weather interpretation codes (simplified)
function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code >= 1 && code <= 3) return 'Partly cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export const getLocalWeather = async (): Promise<WeatherData | undefined> => {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported");
    return undefined;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          
          if (!response.ok) {
            throw new Error('Weather fetch failed');
          }

          const data = await response.json();
          const current = data.current_weather;
          const condition = getWeatherCondition(current.weathercode);
          const isRainy = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('shower') || condition.toLowerCase().includes('thunder');

          resolve({
            temperature: current.temperature,
            condition: condition,
            isRainy: isRainy,
            locationName: "Current Location",
            latitude: latitude,
            longitude: longitude
          });
        } catch (error) {
          console.error("Error fetching weather:", error);
          resolve(undefined);
        }
      },
      (error) => {
        console.warn("Geolocation permission denied or error:", error);
        resolve(undefined);
      }
    );
  });
};
