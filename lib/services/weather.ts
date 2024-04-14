"use server";
import * as geocodeService from './geocode';

export const search = async (searchText: string) => {
  const geocode = await geocodeService.search(searchText);
  if (geocode.error) return geocode;

  const gridpointResponse = await fetch(`https://api.weather.gov/points/${geocode.latt},${geocode.longt}`);
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