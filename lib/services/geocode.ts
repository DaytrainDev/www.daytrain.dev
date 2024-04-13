export const search = async (searchText: string) => {
  const geocodeResponse = await fetch(`https://geocode.xyz/${encodeURIComponent(searchText)}?region='US'&json=1`);
  const {latt, longt } = await geocodeResponse.json();
  if (isNaN(latt) || isNaN(longt)) {
    return { error: 'Geocode for Location not Found' };
  }

  return { latt, longt };
}
