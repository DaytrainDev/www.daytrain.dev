'use client';
// import useDebounce from '@/lib/hooks/useDebounce';
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react';

import './styles.css'

const constants = {
  "days": ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
};

// https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-122.php
const toOrdinalSuffix = (num: string) => {
  const int = parseInt(num),
    digits = [int % 10, int % 100],
    ordinals = ['st', 'nd', 'rd', 'th'],
    oPattern = [1, 2, 3, 4],
    tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];
  return oPattern.includes(digits[0]) && !tPattern.includes(digits[1])
    ? ordinals[digits[0] - 1]
    : ordinals[3];
};

async function getData(searchText: string) {
  if (!searchText || searchText.length < 2) return;
  const errmsg = 'Forecast for Location not Found';

  // TODO: parse state codes into state names or do seperate zip code lookup
  const geocodeResponse = await fetch(`https://geocode.xyz/${encodeURIComponent(searchText)}?region='US'&json=1`);
  const {latt, longt } = await geocodeResponse.json();
  if (isNaN(latt) || isNaN(longt)) return { error: errmsg };

  const gridpointResponse = await fetch(`https://api.weather.gov/points/${latt},${longt}`);
  const parsedGridpointResponse = await gridpointResponse.json();
  if (!parsedGridpointResponse?.properties) return { error: errmsg };

  const { properties: { forecast: forcastEndpoint, relativeLocation: { properties: location } } } = parsedGridpointResponse;
  if (!forcastEndpoint) return { error: errmsg };

  const forecastResponse = await fetch(forcastEndpoint);
  const parsedForecastResponse = await forecastResponse.json();
  if (!parsedForecastResponse) return { error: errmsg };

  const { properties: forecast } = parsedForecastResponse;
  if (!forecast) return { error: errmsg };

  return { forecast, location } as any;
}

export default function Home() {
  let timeout: NodeJS.Timeout;
  let signal: AbortSignal;
  const [searchText, setSearchText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResultData, setSearchResultData]: any = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateData = useCallback(async (incSearchText: string) => {
    setLoading(true);
    const data = await getData(incSearchText);
    if (data?.error) {
      setErrorMsg(data.error);
    } else if (data) {
      setErrorMsg('');
      setSearchResultData(data);
    }
    setLoading(false);
  // throttle this request to allow for full use rinput and avoid hitting api limits
  }, []);

  useEffect(() => {
    const defaultSearchText = '66044';
    setSearchText(defaultSearchText),
    updateData(defaultSearchText);
  }, [updateData]);
  
  async function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(e.target.value);
    updateData(e.target.value);
  }

  const location = searchResultData?.location ? `${searchResultData?.location?.city}, ${searchResultData?.location?.state}` : '';
  const timeObj = searchResultData?.forecast?.updateTime && new Date(searchResultData?.forecast?.updateTime);
  const time = timeObj && `updated ${timeObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  const today = searchResultData?.forecast?.periods[0];
  const dailyForecast = searchResultData?.forecast?.periods.slice(1);
  // TODO: group day and night forecasts

  return (
    <main className="container">
      <div className="header">
        <div className="header-label">
          US Weather
        </div>
        <div className="control-wrapper">
          <input className="control" value={searchText} onChange={handleSearchInput} type="text" placeholder="Enter Zipcode, City, or State" />
        </div>
        <div className="link-back">
          <a href="https://daytrain.dev/" target="_blank" rel="noreferrer">...back to daytrain.dev</a>.
        </div>
      </div>
      <div className={loading ? 'content' : 'hidden'}> 
        Loading...
      </div>
      <div role="alert" className={!errorMsg || loading ? 'hidden' : 'relative block w-full p-4 mb-4 text-base leading-5 text-white bg-red-500 font-regular'}>
        {errorMsg}
      </div>
      <div className={!today || loading || errorMsg ? 'hidden' : ''}>
        <div className="content">
          <div className="icon-wrapper">
            {today?.icon && <Image
              className="rounded-full"
              src={today?.icon}
              alt={today?.shortForecast}
              width={180}
              height={180}
              priority
            />}
          </div>
          <div className="current-wrapper">
            <div className="location">{location}</div>
            <div className="temp">{`${today?.temperature}`}&deg;</div>
            <div className="short-forecast">{today?.shortForecast}</div>
            <div className="update-time">{time}</div>
          </div>
          {/* <div>
            <div>{tonight}</div>
          </div>
          <pre>{JSON.stringify(dailyForecast, null, 2)}</pre> */}
        </div>
        <div className="detail-forecast">{today?.detailedForecast}</div>
        <hr/>
        <div className="daily-forecast-label"> 
          Extended Forecast
        </div>
        <div className="daily-forecast-content"> 
          {dailyForecast?.map((item: any) => {
            const dateObj = item?.startTime && new Date(item?.startTime);
            const dayOfWeek = dateObj && `${constants.days[dateObj.getDay(dateObj)]}`;
            const dayOfMonth = dateObj && `${dateObj.getDate(dateObj)}`;
            const ordinal = dateObj && `${toOrdinalSuffix(dayOfMonth)}`;
            
            return (
              <div key={item.number} className="daily-forecast-item">
                <p>{dayOfMonth}<small>{ordinal}</small></p>
                <p>{item?.name}</p>
                {item?.icon && <Image
                  className="daily-forecast-icon"
                  src={item?.icon}
                  alt={item?.shortForecast}
                  width={90}
                  height={90}
                  priority
                />}
                <div className="daily-forecast-temp">{`${item?.temperature}`}&deg;</div>
                {item?.shortForecast}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}