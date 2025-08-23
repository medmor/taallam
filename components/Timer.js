'use client'
import React, { useEffect, useRef, useState } from 'react';

const pad = (n) => n.toString().padStart(2, '0');

// Simple timer component
// Props:
// - active: boolean (start/pause)
// - resetKey: when this changes the timer resets to 0
// - onTick(seconds): optional callback called every second
// - onStop(seconds): optional callback called when active turns false
const Timer = ({ active = true, resetKey = 0, onTick, onStop }) => {
  const [seconds, setSeconds] = useState(0);
  const secondsRef = useRef(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  // reset when resetKey changes
  useEffect(() => {
    setSeconds(0);
  }, [resetKey]);

  useEffect(() => {
    if (active) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setSeconds(s => {
            const ns = s + 1;
            if (onTick) onTick(ns);
            return ns;
          });
        }, 1000);
      }
    } else {
      // pause/stop
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (onStop) onStop(secondsRef.current);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active]);

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return (
    <div style={{ minWidth: 68, textAlign: 'center', fontWeight: 600 }} aria-label="timer">
      {pad(mm)}:{pad(ss)}
    </div>
  );
};

export default Timer;
