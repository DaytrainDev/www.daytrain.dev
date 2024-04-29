'use client';
// import useDebounce from '@/lib/hooks/useDebounce';
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react';
import { Geolocation } from '@/lib/services/geocode';
import { debounce } from '@mui/material';
import { SessionProvider, useSession } from 'next-auth/react';
import './weather.css'

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

const forecastItem = (item: any) => {
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
}

function WeatherUI({ handleGeoSearch, handleWeatherSearch }: Record<string, any>) {
  const session = useSession();
  const searchRef = useRef(null as any);
  const [forecast, setForecast]: any = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce(async () => {
      const incSearchText = searchRef.current.value;
      if (!incSearchText || incSearchText.length < 2) return;
      const newGeoCode = await handleGeoSearch(searchRef.current.value);
      updateWeather(newGeoCode);
    }, 1250),
    []
  );

  const updateWeather = useCallback(
    debounce(async (incGeoCode: Geolocation) => {
      setLoading(true);
      const newForecast = await handleWeatherSearch(incGeoCode).catch(() => {
        setErrorMsg('Could not update forecast. Please try again.');
      });
      if (newForecast?.error) {
        setErrorMsg(newForecast.error);
      } else if (newForecast) {
        setForecast(newForecast);
        setErrorMsg('');
      }
      setLoading(false);
    }, 1250),
    []
  );

  useEffect(() => {
    if('geolocation' in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        updateWeather({ latitude: coords.latitude, longitude: coords.longitude } as Geolocation);
      });
    }
  }, []);

  const location = forecast?.location ? `${forecast?.location?.city}, ${forecast?.location?.state}` : '';
  const timeObj = forecast?.forecast?.updateTime && new Date(forecast?.forecast?.updateTime);
  const time = timeObj && `updated ${timeObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  const today = forecast?.forecast?.periods[0];
  const extendedForecast = forecast?.forecast?.periods.slice(1);
  // TODO: group day and night forecasts

  return (
    (session.status === 'loading')
    ? (<div>Loading...</div>)
    : !(session.status === 'authenticated')
    ? (<>
        <div>You need to be logged in to weather.</div>
        <div className="link-back">
          <a href="/" rel="noreferrer">...back to home</a>
        </div>
      </>
    )
    : (
    <main className="container">
      <div className="header">
        <div className="header-label">
          US Weather
        </div>
        <div className="control-wrapper">
          <input 
            ref={searchRef}
            onChange={handleSearch}
            className="control text-slate-800"
            type="text" 
            placeholder="Enter Location..." 
          />
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
        </div>
        <div className="detail-forecast">{today?.detailedForecast}</div>
        <hr/>
        <div className="daily-forecast-label"> 
          Extended Forecast
        </div>
        <div className="daily-forecast-content"> 
          {extendedForecast?.map(forecastItem)}
        </div>
      </div>
    </main>
  ));
}

export const WeatherSession = ({ session, handleGeoSearch, handleWeatherSearch }: any) => {

  return (
    <SessionProvider session={session}>
      {session && <WeatherUI
        handleGeoSearch={handleGeoSearch} 
        handleWeatherSearch={handleWeatherSearch}
      />}
    </SessionProvider>
  );
}