import React from 'react';
import { VisitEvent } from '../types';
import { getEventsForDate, formatTime, getEndTime } from '../utils/date';
import { PlusIcon } from './Icons';

interface DailyScheduleViewProps {
  viewingDate: Date;
  events: VisitEvent[];
  holidays: Record<string, string>;
  onAddEvent: () => void;
  onEventClick: (event: VisitEvent) => void;
}

const formatDateWithDay = (date: Date) => {
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}月${date.getDate()}日 (${weekDays[date.getDay()]})`;
}

export const DailyScheduleView: React.FC<DailyScheduleViewProps> = ({ viewingDate, events, onAddEvent, onEventClick }) => {
  const dayEvents = getEventsForDate(viewingDate, events);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-full flex flex-col" style={{minHeight: '80vh'}}>
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {formatDateWithDay(viewingDate)}
        </h2>
        <button 
          onClick={onAddEvent}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          予定を追加
        </button>
      </div>
      
      {dayEvents.length > 0 ? (
        <ul className="space-y-3 overflow-y-auto flex-grow">
          {dayEvents.map(event => (
            <li key={event.id}>
              <button
                onClick={() => onEventClick(event)}
                className="w-full flex items-start gap-4 p-3 rounded-lg hover:bg-blue-50 text-left transition-colors duration-200"
              >
                <div className="flex-shrink-0 text-center w-20 pt-1">
                  <p className="font-mono font-semibold text-gray-800">{formatTime(new Date(event.startDateTime))}</p>
                  <p className="font-mono text-sm text-gray-500">|</p>
                  <p className="font-mono font-semibold text-gray-800">{formatTime(getEndTime(event.startDateTime, event.duration))}</p>
                </div>
                <div className="flex-grow border-l-4 border-blue-400 pl-4">
                  <h3 className="font-bold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.duration}分</p>
                  {event.memo && (
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{event.memo}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          <p className="font-semibold">予定はありません</p>
          <p className="text-sm mt-1">「予定を追加」ボタンから新しい予定を作成できます。</p>
        </div>
      )}
    </div>
  );
};
