import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Calendar } from './components/Calendar';
import { EventModal } from './components/EventModal';
import { HelpModal } from './components/HelpModal';
import { CreatorModal } from './components/CreatorModal';
import { ChevronLeftIcon, ChevronRightIcon, LogOutIcon, HelpCircleIcon, InfoIcon } from './components/Icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { VisitEvent } from './types';
import { DailyScheduleView } from './components/DailyScheduleView';
import { Spinner } from './components/Spinner';
import { useEvents } from './hooks/useEvents';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Login';

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const { events, loading: eventsLoading, addEvent, updateEvent, deleteEvent } = useEvents();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewingDate, setViewingDate] = useState(new Date());
  const [holidays, setHolidays] = useLocalStorage<Record<string, string>>('jp-holidays', {});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
  const [eventToEdit, setEventToEdit] = useState<VisitEvent | null>(null);

  const dailyScheduleRef = useRef<HTMLDivElement>(null);
  
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
    if (window.innerWidth < 1024) { // lg breakpoint
        dailyScheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleAddNewEvent = useCallback(() => {
    setSelectedDateForModal(viewingDate);
    setEventToEdit(null);
    setIsModalOpen(true);
  }, [viewingDate]);
  
  const handleEventClick = useCallback((event: VisitEvent, dateOfOccurrence: Date) => {
    setEventToEdit(event);
    setSelectedDateForModal(dateOfOccurrence);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDateForModal(null);
    setEventToEdit(null);
  }, []);
  
  const handleSaveEvent = useCallback(async (eventData: VisitEvent, updateType: 'single' | 'future' | 'all', originalDate?: Date) => {
    const isNewEvent = !eventToEdit?.id;
    if (isNewEvent) {
      const { id, ...newEventData } = eventData;
      await addEvent(newEventData);
    } else {
      await updateEvent(eventData, updateType, originalDate);
    }
    handleCloseModal();
  }, [addEvent, updateEvent, handleCloseModal, eventToEdit]);
  
  const handleDeleteEvent = useCallback(async (eventId: string, deleteType: 'single' | 'future' | 'all', dateOfOccurrence: Date | null) => {
    await deleteEvent(eventId, deleteType, dateOfOccurrence);
    handleCloseModal();
  }, [deleteEvent, handleCloseModal]);
  
  if (authLoading) {
    return <Spinner />;
  }

  if (!user) {
    return <Login />;
  }

  if (eventsLoading) {
    return <Spinner />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">訪問スケジュール</h1>
            <button onClick={handleToday} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              今日
            </button>
            <button 
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="使い方"
            >
              <HelpCircleIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsCreatorModalOpen(true)}
              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
              title="製作者情報"
            >
              <InfoIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => logout()} 
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              title="ログアウト"
            >
              <LogOutIcon className="w-5 h-5" />
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
          <div className="lg:col-span-2" ref={dailyScheduleRef}>
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

      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />

      <CreatorModal 
        isOpen={isCreatorModalOpen} 
        onClose={() => setIsCreatorModalOpen(false)} 
      />
    </div>
  );
}

export default App;
