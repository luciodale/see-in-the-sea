import { useEffect, useState } from 'react';

type CountdownResult = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUrgent: boolean;
};

export function useCountdown(year: number | null): CountdownResult {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (year === null) return;

    const id = setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => clearInterval(id);
  }, [year]);

  if (year === null) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      isUrgent: false,
    };
  }

  const target = new Date(year, 11, 31, 23, 59, 0).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      isUrgent: false,
    };
  }

  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired: false,
    isUrgent: diff < FORTY_EIGHT_HOURS,
  };
}
