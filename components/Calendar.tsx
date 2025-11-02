import React, { useMemo } from 'react';
import { VisitEvent } from '../types';
import { getDaysInMonth, isSameDay, formatTime, getEndTime, formatDateToYMD, getEventsForDate } from '../utils/date';

interface CalendarProps {
  currentDate: Date;
  viewingDate: Date;
  events: VisitEvent[];
  holidays: Record<string, string>;
  onDayClick: (date: Date) => void;
  onEventClick: (event: VisitEvent) => void;
}

const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

export const Calendar: React.FC<CalendarProps> = ({ currentDate, viewingDate, events, holidays, onDayClick, onEventClick }) => {
  const monthDays = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  
  const isToday = (date: Date) => isSameDay(date, new Date());
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="grid grid-cols-7 gap-px text-center font-semibold text-gray-600 border-b pb-2 mb-2">
        {weekDays.map((day, index) => (
          <div key={day} className={`text-sm ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}`}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {monthDays.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const dayEvents = getEventsForDate(day, events);
          const isViewingDay = isSameDay(day, viewingDate);
          
          const dayOfWeek = day.getDay();
          const isSaturday = dayOfWeek === 6;
          const isSunday = dayOfWeek === 0;
          const ymd = formatDateToYMD(day);
          const holidayName = holidays[ymd];
          const isHoliday = !!holidayName;
          const isTodayDate = isToday(day);

          let dayNumberClasses = "text-sm font-medium mb-1";
          if (isTodayDate) {
              dayNumberClasses += ` ${isHoliday ? 'bg-red-500' : 'bg-blue-600'} text-white rounded-full w-7 h-7 flex items-center justify-center font-bold`;
          } else {
             if (isSaturday) dayNumberClasses += ' text-blue-600';
             if (isSunday || isHoliday) dayNumberClasses += ' text-red-500';
          }

          const containerClasses = `relative flex flex-col min-h-[120px] p-1.5 transition-colors duration-200 cursor-pointer ${
            isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
          } ${
            isViewingDay ? 'ring-2 ring-blue-500 z-10' : 'hover:bg-blue-50'
          }`;

          return (
            <div
              key={index}
              className={containerClasses}
              onClick={() => onDayClick(day)}
            >
              <div className="flex justify-between items-center">
                <span className={dayNumberClasses}>
                  {day.getDate()}
                </span>
              </div>
              {isHoliday && <div className="text-xs text-red-500 truncate mb-1" style={{fontSize: '0.7rem'}}>{holidayName}</div>}

              <div className="flex-grow space-y-1 overflow-y-auto">
                {dayEvents.map(event => {
                    const startTime = formatTime(new Date(event.startDateTime));
                    const endTime = formatTime(getEndTime(event.startDateTime, event.duration));
                    return (
                        <div
                            key={event.id}
                            className="bg-blue-100 text-blue-800 p-1.5 rounded-md text-xs cursor-pointer hover:bg-blue-200 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event);
                            }}
                        >
                            <p className="font-semibold truncate">{event.title}</p>
                            <p>{startTime} - {endTime}</p>
                        </div>
                    );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};