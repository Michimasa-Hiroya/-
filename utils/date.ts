import { VisitEvent } from '../types';

export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const days = [];
  
  // Pad start with previous month's days
  const startDayOfWeek = firstDayOfMonth.getDay();
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, 0);
    prevMonthDay.setDate(prevMonthDay.getDate() - i);
    days.unshift(prevMonthDay);
  }
  
  // Add current month's days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Pad end with next month's days to fill the grid (6 rows)
  const totalDays = days.length;
  const daysToFill = 42 - totalDays; // 6 rows * 7 days
  for (let i = 1; i <= daysToFill; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};


const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export const differenceInCalendarWeeks = (dateLeft: Date, dateRight: Date): number => {
    const startOfWeekLeft = getStartOfWeek(dateLeft);
    const startOfWeekRight = getStartOfWeek(dateRight);
    const diff = startOfWeekLeft.getTime() - startOfWeekRight.getTime();
    return Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export const getEndTime = (startDateTime: number, duration: number): Date => {
  const endDate = new Date(startDateTime);
  endDate.setMinutes(endDate.getMinutes() + duration);
  return endDate;
};

export const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getEventsForDate = (date: Date, allEvents: VisitEvent[], holidays: Record<string, string>): VisitEvent[] => {
    const ymd = formatDateToYMD(date);
    const isHoliday = !!holidays[ymd];

    return allEvents
      .filter(event => {
        const eventStartDate = new Date(event.startDateTime);
        eventStartDate.setHours(0,0,0,0);
        
        if (date < eventStartDate) return false;

        switch (event.recurring) {
          case 'none':
            return isSameDay(date, eventStartDate);
          case 'weekly':
            if (isHoliday) return false;
            return date.getDay() === eventStartDate.getDay();
          case 'biweekly':
            if (isHoliday) return false;
            const weekDiff = differenceInCalendarWeeks(date, eventStartDate);
            return date.getDay() === eventStartDate.getDay() && weekDiff % 2 === 0;
          default:
            return false;
        }
      })
      .sort((a, b) => a.startDateTime - b.startDateTime);
};