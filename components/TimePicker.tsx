
import React, { useState, useMemo, useEffect, useRef } from 'react';

interface TimePickerProps {
  initialHour: number;
  initialMinute: number;
  onTimeChange: (time: { hour: number; minute: number }) => void;
}

const CLOCK_SIZE = 280;
const CLOCK_CENTER = CLOCK_SIZE / 2;
const OUTER_HOUR_RADIUS = CLOCK_CENTER - 28;
const INNER_HOUR_RADIUS = CLOCK_CENTER - 64;
const MINUTE_RADIUS = CLOCK_CENTER - 28;
const HOUR_HAND_LENGTH = 70;
const MINUTE_HAND_LENGTH = 100;

export const TimePicker: React.FC<TimePickerProps> = ({ initialHour, initialMinute, onTimeChange }) => {
  const [view, setView] = useState<'hours' | 'minutes'>('hours');
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onTimeChange({ hour, minute });
  }, [hour, minute, onTimeChange]);

  const handleClockClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clockRef.current) return;

    const rect = clockRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - CLOCK_CENTER;
    const y = e.clientY - rect.top - CLOCK_CENTER;
    
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    const positiveAngle = angle < 0 ? angle + 360 : angle;

    if (view === 'hours') {
        const selectedVal = Math.round(positiveAngle / 30) % 12; // 0-11
        const distance = Math.sqrt(x * x + y * y);

        const outerHours = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        const innerHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        if (distance > (INNER_HOUR_RADIUS + OUTER_HOUR_RADIUS) / 2) { // Outer ring
            setHour(outerHours[selectedVal]);
        } else { // Inner ring
            setHour(innerHours[selectedVal]);
        }
        setView('minutes');

    } else { // minutes view
        const selectedMinute = Math.round(positiveAngle / 6);
        const snappedMinute = Math.round(selectedMinute / 5) * 5;
        setMinute(snappedMinute === 60 ? 0 : snappedMinute);
    }
  };

  const hourNumbers = useMemo(() => {
    const numbers = [];
    const outerLabels = ['00', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    const innerLabels = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    
    for (let i = 0; i < 12; i++) {
        const angle = i * 30 - 90;
        const cos = Math.cos((angle * Math.PI) / 180);
        const sin = Math.sin((angle * Math.PI) / 180);
        
        numbers.push({
            number: outerLabels[i],
            x: CLOCK_CENTER + cos * OUTER_HOUR_RADIUS,
            y: CLOCK_CENTER + sin * OUTER_HOUR_RADIUS,
            key: `h-out-${i}`,
            size: 'text-base'
        });
        
        numbers.push({
            number: innerLabels[i],
            x: CLOCK_CENTER + cos * INNER_HOUR_RADIUS,
            y: CLOCK_CENTER + sin * INNER_HOUR_RADIUS,
            key: `h-in-${i}`,
            size: 'text-sm text-gray-600'
        });
    }
    return numbers;
  }, []);

  const minuteNumbers = useMemo(() => {
    const numbers = [];
    for (let i = 0; i < 12; i++) {
        const angle = i * 30 - 90;
        const x = CLOCK_CENTER + Math.cos((angle * Math.PI) / 180) * MINUTE_RADIUS;
        const y = CLOCK_CENTER + Math.sin((angle * Math.PI) / 180) * MINUTE_RADIUS;
        const number = String(i * 5).padStart(2, '0');
        numbers.push({ number, x, y, key: `m-${i}`, size: 'text-base' });
    }
    return numbers;
  }, []);

  const displayedNumbers = view === 'hours' ? hourNumbers : minuteNumbers;
  const minuteHandRotation = minute * 6;
  const hourHandRotation = (hour % 12) * 30 + minute * 0.5;

  return (
    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-center p-2 text-4xl font-mono bg-white rounded-lg shadow-inner w-48">
        <span
          className={`cursor-pointer p-1 rounded ${view === 'hours' ? 'text-blue-600 bg-blue-100' : 'text-gray-700'}`}
          onClick={() => setView('hours')}
        >
          {String(hour).padStart(2, '0')}
        </span>
        <span className="text-gray-700">:</span>
        <span
          className={`cursor-pointer p-1 rounded ${view === 'minutes' ? 'text-blue-600 bg-blue-100' : 'text-gray-700'}`}
          onClick={() => setView('minutes')}
        >
          {String(minute).padStart(2, '0')}
        </span>
      </div>
      
      <div
        ref={clockRef}
        className="relative my-4"
        style={{ width: `${CLOCK_SIZE}px`, height: `${CLOCK_SIZE}px` }}
        onClick={handleClockClick}
      >
        <div 
          className="w-full h-full bg-white rounded-full shadow-lg cursor-pointer select-none"
        >
            <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-20"></div>
            {/* Hands */}
            <div
                className="absolute top-1/2 left-1/2 w-1 bg-gray-800 rounded-full origin-bottom z-10"
                style={{ transform: `translateX(-50%) rotate(${hourHandRotation}deg)`, height: `${HOUR_HAND_LENGTH}px`, top: `calc(50% - ${HOUR_HAND_LENGTH}px)` }}
            ></div>
            <div
                className="absolute top-1/2 left-1/2 w-0.5 bg-gray-600 rounded-full origin-bottom z-10"
                style={{ transform: `translateX(-50%) rotate(${minuteHandRotation}deg)`, height: `${MINUTE_HAND_LENGTH}px`, top: `calc(50% - ${MINUTE_HAND_LENGTH}px)` }}
            ></div>
            
            {/* Numbers */}
            {displayedNumbers.map(({ number, x, y, key, size }) => (
                <div
                    key={key}
                    className={`absolute flex items-center justify-center w-8 h-8 rounded-full font-medium ${size}`}
                    style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
                >
                    {number}
                </div>
            ))}
        </div>
      </div>
      <p className="text-sm text-gray-500 h-5">
        {view === 'hours' ? '時間を選択' : '分を選択 (5分刻み)'}
      </p>
    </div>
  );
};
