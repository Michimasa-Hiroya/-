import React, { useState, useCallback, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { EventModal } from './components/EventModal';
import { ChevronLeftIcon, ChevronRightIcon } from './components/Icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { VisitEvent } from './types';
import { DailyScheduleView } from './components/DailyScheduleView';
import { PasswordScreen } from './components/PasswordScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewingDate, setViewingDate] = useState(new Date());
  const [events, setEvents] = useLocalStorage<VisitEvent[]>('visit-nurse-schedule-events', []);
  const [holidays, setHolidays] = useLocalStorage<Record<string, string>>('jp-holidays', {});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
  const [eventToEdit, setEventToEdit] = useState<VisitEvent | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
        if (Object.keys(holidays).length === 0) {
            try {
                const response = await fetch('https://holidays-jp.github.io/api/v1/date.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setHolidays(data);
            } catch (error) {
                console.error("Failed to fetch holidays:", error);
            }
        }
    };
    fetchHolidays();
  }, [holidays, setHolidays]);
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setViewingDate(today);
  };
  
  const handleDayClick = useCallback((date: Date) => {
    setViewingDate(date);
  }, []);

  const handleAddNewEvent = useCallback(() => {
    setSelectedDateForModal(viewingDate);
    setEventToEdit(null);
    setIsModalOpen(true);
  }, [viewingDate]);
  
  const handleEventClick = useCallback((event: VisitEvent) => {
    setEventToEdit(event);
    setSelectedDateForModal(new Date(event.startDateTime));
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDateForModal(null);
    setEventToEdit(null);
  }, []);
  
  const handleSaveEvent = useCallback((eventData: VisitEvent) => {
    setEvents(prevEvents => {
      const eventIndex = prevEvents.findIndex(e => e.id === eventData.id);
      if (eventIndex > -1) {
        const updatedEvents = [...prevEvents];
        updatedEvents[eventIndex] = eventData;
        return updatedEvents;
      } else {
        return [...prevEvents, eventData];
      }
    });
    handleCloseModal();
  }, [setEvents, handleCloseModal]);
  
  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
    handleCloseModal();
  }, [setEvents, handleCloseModal]);
  
  if (!isAuthenticated) {
    return <PasswordScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">訪問看護スケジュール</h1>
            <button onClick={handleToday} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              今日
            </button>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <h2 
              className="text-xl font-semibold w-48 text-center tabular-nums"
            >
              {`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}
            </h2>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-5">
              <Calendar
                currentDate={currentDate}
                viewingDate={viewingDate}
                events={events}
                holidays={holidays}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
              />
          </div>
          <div className="lg:col-span-2">
              <DailyScheduleView 
                viewingDate={viewingDate}
                events={events}
                holidays={holidays}
                onAddEvent={handleAddNewEvent}
                onEventClick={handleEventClick}
              />
          </div>
        </main>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        eventToEdit={eventToEdit}
        selectedDate={selectedDateForModal}
      />
    </div>
  );
}

export default App;