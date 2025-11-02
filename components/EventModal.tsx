import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VisitEvent, RecurringType, Duration } from '../types';
import { TimePicker } from './TimePicker';
import { TrashIcon, XMarkIcon, ClockIcon } from './Icons';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: VisitEvent) => void;
  onDelete: (eventId: string) => void;
  eventToEdit: VisitEvent | null;
  selectedDate: Date | null;
}

const DURATIONS: Duration[] = [20, 30, 40, 60, 90];

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, eventToEdit, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [selectedTime, setSelectedTime] = useState({ hour: 9, minute: 0 });
  const [duration, setDuration] = useState<Duration>(60);
  const [recurring, setRecurring] = useState<RecurringType>('none');
  const [memo, setMemo] = useState('');
  
  const initialDate = useMemo(() => eventToEdit ? new Date(eventToEdit.startDateTime) : selectedDate, [eventToEdit, selectedDate]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      // FIX: Corrected typo from eventToToEdit to eventToEdit.
      const d = new Date(eventToEdit.startDateTime);
      setSelectedTime({ hour: d.getHours(), minute: d.getMinutes() });
      setDuration(eventToEdit.duration);
      setRecurring(eventToEdit.recurring);
      setMemo(eventToEdit.memo || '');
    } else if (selectedDate) {
      // Reset form for new event
      setTitle('');
      setSelectedTime({ hour: 9, minute: 0 });
      setDuration(60);
      setRecurring('none');
      setMemo('');
    }
  }, [eventToEdit, selectedDate, isOpen]);
  
  const handleSave = useCallback(() => {
    if (!title || !initialDate) return;

    const startDateTime = new Date(initialDate);
    startDateTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0);

    const eventData: VisitEvent = {
      id: eventToEdit?.id || Date.now().toString(),
      title,
      startDateTime: startDateTime.getTime(),
      duration,
      recurring,
      memo,
    };
    onSave(eventData);
  }, [title, initialDate, selectedTime, duration, recurring, memo, eventToEdit?.id, onSave]);

  const handleDelete = useCallback(() => {
    if (eventToEdit) {
      onDelete(eventToEdit.id);
    }
  }, [eventToEdit, onDelete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{eventToEdit ? '予定の編集' : '新しい予定'}</h2>
          
          <div className="space-y-6">
            <input
              type="text"
              placeholder="利用者名または訪問内容"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
            
            <div className="flex flex-col items-center">
                <TimePicker initialHour={selectedTime.hour} initialMinute={selectedTime.minute} onTimeChange={setSelectedTime} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">時間 (分)</label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      duration === d ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {d}分
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="recurring-select" className="text-sm font-medium text-gray-700 mb-2 block">繰り返し</label>
              <select
                id="recurring-select"
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as RecurringType)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">なし</option>
                <option value="weekly">毎週</option>
                <option value="biweekly">隔週</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="memo-input" className="text-sm font-medium text-gray-700 mb-2 block">メモ</label>
              <textarea
                id="memo-input"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="特記事項など"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

          </div>

          <div className="mt-8 flex justify-between items-center">
            <div>
              {eventToEdit && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                  削除
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                キャンセル
              </button>
              <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-300" disabled={!title}>
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};