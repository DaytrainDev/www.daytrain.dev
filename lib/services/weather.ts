"use server";

export interface WeatherLocation {
  city: string;
  state: string;
}

export interface WeatherPeriod {
  number: number;
  name: string;
  startTime: string;
  temperature: number;
  temperatureUnit: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface WeatherForecast {
  updateTime: string;
  periods: WeatherPeriod[];
}

export interface WeatherResult {
  forecast?: WeatherForecast;
  location?: WeatherLocation;
  error?: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

const parseGeo = (geo: number) => `${Math.round(geo * 10000) / 10000}`;

export const search = async (geocode: Partial<GeoCoordinates>): Promise<WeatherResult> => {
  if (!(geocode.latitude && geocode.longitude)) {
    return { error: 'Invalid coordinates provided' };
  }

  try {
    // Get grid point for the coordinates
    const gridpointResponse = await fetch(
      `https://api.weather.gov/points/${parseGeo(geocode.latitude)},${parseGeo(geocode.longitude)}`,
      {
        headers: {
          'User-Agent': 'daytrain.dev weather app',
          'Accept': 'application/geo+json',
        },
      }
    );

    if (!gridpointResponse.ok) {
      if (gridpointResponse.status === 404) {
        return { error: 'Location not found. Weather data is only available for US locations.' };
      }
      return { error: `Weather service error: ${gridpointResponse.status}` };
    }

    const parsedGridpointResponse = await gridpointResponse.json();

    if (!parsedGridpointResponse?.properties) {
      return { error: 'Invalid response from weather service' };
    }

    const {
      properties: {
        forecast: forecastEndpoint,
        relativeLocation
      }
    } = parsedGridpointResponse;

    if (!forecastEndpoint) {
      return { error: 'Forecast endpoint not found for this location' };
    }

    const location: WeatherLocation = {
      city: relativeLocation?.properties?.city || 'Unknown',
      state: relativeLocation?.properties?.state || '',
    };

    // Get the actual forecast
    const forecastResponse = await fetch(forecastEndpoint, {
      headers: {
        'User-Agent': 'daytrain.dev weather app',
        'Accept': 'application/geo+json',
      },
    });

    if (!forecastResponse.ok) {
      return { error: `Forecast service error: ${forecastResponse.status}` };
    }

    const parsedForecastResponse = await forecastResponse.json();

    if (!parsedForecastResponse?.properties) {
      return { error: 'Invalid forecast response' };
    }

    const forecast: WeatherForecast = {
      updateTime: parsedForecastResponse.properties.updateTime,
      periods: parsedForecastResponse.properties.periods,
    };

    return { forecast, location };
  } catch (err) {
    console.error('[Weather Service] Error:', err);
    return { error: 'Failed to fetch weather data. Please try again.' };
  }
};
