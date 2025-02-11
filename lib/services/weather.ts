"use server";
import { Geolocation } from '../types/daytrain';

const parseGeo = (geo: number) => `${Math.round(geo * 100) / 100}`

export const search = async (geocode: Partial<GeolocationCoordinates>) => {
  if (!(geocode.latitude && geocode.longitude)) {
    return {};
  }
  
  const gridpointResponse = await fetch(`https://api.weather.gov/points/${parseGeo(geocode.latitude)},${parseGeo(geocode.longitude)}`);
  const parsedGridpointResponse = await gridpointResponse.json();
  if (!parsedGridpointResponse?.properties) return { error: 'Gridpoint Server could not be reached' };

  const { properties: { forecast: forcastEndpoint, relativeLocation: { properties: location } } } = parsedGridpointResponse;
  if (!forcastEndpoint) return { error: 'Gridpoints for Location not found' };

  const forecastResponse = await fetch(forcastEndpoint);
  const parsedForecastResponse = await forecastResponse.json();
  if (!parsedForecastResponse) return { error: 'Forecast Server could not be reached' };

  const { properties: forecast } = parsedForecastResponse;
  if (!forecast) return { error: 'Forecast for Location not found'  };

  return { forecast, location };
}
