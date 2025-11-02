import React from 'react';
import { VisitEvent } from '../types';
import { getEventsForDate, formatTime, getEndTime } from '../utils/date';
import { PlusIcon } from './Icons';

interface DailyScheduleViewProps {
  viewingDate: Date;
  events: VisitEvent[];
  holidays: Record<string, string>;
  onAddEvent: () => void;
  onEventClick: (event: VisitEvent, date: Date) => void;
}

const formatFullDateWithDay = (date: Date) => {
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月${date.getDate()}日(${weekDays[date.getDay()]})`;
};

export const DailyScheduleView: React.FC<DailyScheduleViewProps> = ({ viewingDate, events, holidays, onAddEvent, onEventClick }) => {
  const dayEvents = getEventsForDate(viewingDate, events, holidays);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h2 className="text-lg font-bold text-gray-800">
          {formatFullDateWithDay(viewingDate)}
        </h2>
        <button 
          onClick={onAddEvent}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          追加
        </button>
      </div>
      
      {dayEvents.length > 0 ? (
        <ul className="space-y-3 overflow-y-auto flex-grow">
          {dayEvents.map(event => {
            const eventDateForThisOccurrence = new Date(viewingDate);
            const originalEventTime = new Date(event.startDateTime);
            eventDateForThisOccurrence.setHours(originalEventTime.getHours(), originalEventTime.getMinutes());
            
            return (
            <li key={`${event.id}-${viewingDate.getTime()}`}>
              <button
                onClick={() => onEventClick(event, viewingDate)}
                className="w-full flex items-start gap-4 p-3 rounded-lg hover:bg-blue-50 text-left transition-colors duration-200"
              >
                <div className="flex-shrink-0 text-center w-20 pt-1">
                  <p className="font-mono font-semibold text-gray-800">{formatTime(eventDateForThisOccurrence)}</p>
                  <p className="font-mono text-sm text-gray-500">|</p>
                  <p className="font-mono font-semibold text-gray-800">{formatTime(getEndTime(eventDateForThisOccurrence.getTime(), event.duration))}</p>
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
          )})}
        </ul>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500" style={{minHeight: '200px'}}>
           <svg xmlns="http://www.w.org/2000/svg" className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          <p className="font-semibold">予定はありません</p>
          <p className="text-sm mt-1">「追加」ボタンから新しい予定を作成できます。</p>
        </div>
      )}
    </div>
  );
};
