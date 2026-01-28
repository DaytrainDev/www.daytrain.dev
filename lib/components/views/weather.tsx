'use client';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Session } from 'next-auth';
import { SessionProvider, useSession } from 'next-auth/react';
import './weather.css';

interface WeatherPeriod {
  number: number;
  name: string;
  startTime: string;
  temperature: number;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}

interface Forecast {
  updateTime: string;
  periods: WeatherPeriod[];
}

interface Location {
  city: string;
  state: string;
}

interface WeatherData {
  forecast?: Forecast;
  location?: Location;
  error?: string;
}

interface GeoLocation {
  latitude?: number;
  longitude?: number;
  error?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const toOrdinalSuffix = (num: number): string => {
  const digits = [num % 10, num % 100];
  const ordinals = ['st', 'nd', 'rd', 'th'];
  const oPattern = [1, 2, 3, 4];
  const tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];
  return oPattern.includes(digits[0]) && !tPattern.includes(digits[1])
    ? ordinals[digits[0] - 1]
    : ordinals[3];
};

function ForecastItem({ item }: { item: WeatherPeriod }) {
  const dateObj = new Date(item.startTime);
  const dayOfMonth = dateObj.getDate();
  const ordinal = toOrdinalSuffix(dayOfMonth);

  return (
    <div className="daily-forecast-item">
      <p>{dayOfMonth}<small>{ordinal}</small></p>
      <p>{item.name}</p>
      {item.icon && (
        <Image
          className="daily-forecast-icon"
          src={item.icon}
          alt={item.shortForecast}
          width={90}
          height={90}
          priority
        />
      )}
      <div className="daily-forecast-temp">{item.temperature}&deg;</div>
      {item.shortForecast}
    </div>
  );
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface WeatherUIProps {
  handleGeoSearch: (searchText: string) => Promise<GeoLocation>;
  handleWeatherSearch: (geocode: Coordinates) => Promise<WeatherData>;
}

export function WeatherUI({ handleGeoSearch, handleWeatherSearch }: WeatherUIProps) {
  const session = useSession();
  const searchRef = useRef<HTMLInputElement>(null);
  const [forecast, setForecast] = useState<WeatherData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0);

  const fetchWeather = useCallback(async (geocode: Coordinates, requestId: number) => {
    try {
      const newForecast = await handleWeatherSearch(geocode);

      // Only update if this is still the latest request
      if (requestId !== requestIdRef.current) return;

      if (newForecast?.error) {
        setErrorMsg(newForecast.error);
      } else if (newForecast) {
        setForecast(newForecast);
      }
    } catch {
      if (requestId !== requestIdRef.current) return;
      setErrorMsg('Could not update forecast. Please try again.');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [handleWeatherSearch]);

  const handleSearch = useCallback((searchText: string) => {
    if (!searchText || searchText.length < 2) return;

    // Cancel pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Single debounce for the entire search flow
    debounceTimerRef.current = setTimeout(async () => {
      const currentRequestId = ++requestIdRef.current;

      setLoading(true);
      setErrorMsg('');

      try {
        const newGeoCode = await handleGeoSearch(searchText);

        // Check if still latest request
        if (currentRequestId !== requestIdRef.current) return;

        if (newGeoCode?.error || !newGeoCode?.latitude || !newGeoCode?.longitude) {
          setErrorMsg(newGeoCode?.error || 'Location not found');
          setLoading(false);
          return;
        }

        await fetchWeather(
          { latitude: newGeoCode.latitude, longitude: newGeoCode.longitude },
          currentRequestId
        );
      } catch {
        if (currentRequestId !== requestIdRef.current) return;
        setErrorMsg('Search failed. Please try again.');
        setLoading(false);
      }
    }, 500);
  }, [handleGeoSearch, fetchWeather]);

  // Geolocation on mount
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (currentRequestId !== requestIdRef.current) return;
        fetchWeather(
          { latitude: coords.latitude, longitude: coords.longitude },
          currentRequestId
        );
      },
      () => {
        // Geolocation denied or failed - user can still search manually
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    );

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchWeather]);

  const location = forecast?.location
    ? `${forecast.location.city}, ${forecast.location.state}`
    : '';
  const timeObj = forecast?.forecast?.updateTime
    ? new Date(forecast.forecast.updateTime)
    : null;
  const time = timeObj
    ? `updated ${timeObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : '';
  const today = forecast?.forecast?.periods?.[0];
  const extendedForecast = forecast?.forecast?.periods?.slice(1);

  if (session.status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session.status !== 'authenticated') {
    return (
      <>
        <div>You need to be logged in to use weather.</div>
        <div className="link-back">
          <a href="/" rel="noreferrer">...back to home</a>
        </div>
      </>
    );
  }

  return (
    <main className="container">
      <div className="header">
        <div className="header-label">US Weather</div>
        <div className="control-wrapper">
          <input
            ref={searchRef}
            onChange={(e) => handleSearch(e.target.value)}
            className="control text-slate-800"
            type="text"
            placeholder="Enter Location..."
          />
        </div>
      </div>

      {loading && (
        <div className="content">Loading...</div>
      )}

      {errorMsg && !loading && (
        <div
          role="alert"
          className="relative block w-full p-4 mb-4 text-base leading-5 text-white bg-red-500 font-regular"
        >
          {errorMsg}
        </div>
      )}

      {today && !loading && !errorMsg && (
        <>
          <div className="content">
            <div className="icon-wrapper">
              {today.icon && (
                <Image
                  className="rounded-full"
                  src={today.icon}
                  alt={today.shortForecast}
                  width={180}
                  height={180}
                  priority
                />
              )}
            </div>
            <div className="current-wrapper">
              <div className="location">{location}</div>
              <div className="temp">{today.temperature}&deg;</div>
              <div className="short-forecast">{today.shortForecast}</div>
              <div className="update-time">{time}</div>
            </div>
          </div>
          <div className="detail-forecast">{today.detailedForecast}</div>
          <hr />
          <div className="daily-forecast-label">Extended Forecast</div>
          <div className="daily-forecast-content">
            {extendedForecast?.map((item) => (
              <ForecastItem key={item.number} item={item} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

interface WeatherSessionProps {
  session: Session | null;
  handleGeoSearch: (searchText: string) => Promise<GeoLocation>;
  handleWeatherSearch: (geocode: Coordinates) => Promise<WeatherData>;
}

export function WeatherSession({ session, handleGeoSearch, handleWeatherSearch }: WeatherSessionProps) {
  return (
    <SessionProvider session={session}>
      <WeatherUI
        handleGeoSearch={handleGeoSearch}
        handleWeatherSearch={handleWeatherSearch}
      />
    </SessionProvider>
  );
}
