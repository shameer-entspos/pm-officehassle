'use client';

import { useState, useEffect } from 'react';

export default function AnalogClock() {
  const [date, setDate] = useState(new Date('2025-05-24T23:26:00')); // Set to 11:26 PM PKT, May 24, 2025

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, [date]);

  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;

  const secondAngle = (seconds / 60) * 360;
  const minuteAngle = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourAngle = (hours / 12) * 360 + (minutes / 60) * 30;

  return (
    <div className="gradient relative mx-auto h-[200px] w-[200px] rounded-full">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {/* Clock face */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="var(--background)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        {/* Hour marks */}
        {[...Array(12)].map((_, i) => {
          // const angle = (i * 30 - 90) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1="50"
              y1="5"
              x2="50"
              y2="10"
              stroke="var(--foreground)"
              strokeWidth="1"
              transform={`rotate(${i * 30}, 50, 50)`}
            />
          );
        })}
        {/* Hour hand */}
        <line
          x1="50"
          y1="50"
          x2={50 + 25 * Math.cos((hourAngle - 90) * (Math.PI / 180))}
          y2={50 + 25 * Math.sin((hourAngle - 90) * (Math.PI / 180))}
          stroke="var(--foreground)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Minute hand */}
        <line
          x1="50"
          y1="50"
          x2={50 + 35 * Math.cos((minuteAngle - 90) * (Math.PI / 180))}
          y2={50 + 35 * Math.sin((minuteAngle - 90) * (Math.PI / 180))}
          stroke="var(--foreground)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Second hand */}
        <line
          x1="50"
          y1="50"
          x2={50 + 40 * Math.cos((secondAngle - 90) * (Math.PI / 180))}
          y2={50 + 40 * Math.sin((secondAngle - 90) * (Math.PI / 180))}
          stroke="var(--destructive)" // Using destructive for red-like color
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle cx="50" cy="50" r="2" fill="var(--foreground)" />
      </svg>
    </div>
  );
}
