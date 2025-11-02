import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VisitEvent, RecurringType, Duration } from '../types';
import { TimePicker } from './TimePicker';
import { TrashIcon, XMarkIcon } from './Icons';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: VisitEvent) => void;
  onDelete: (eventId: string, deleteType: 'single' | 'all', dateOfOccurrence: Date | null) => void;
  eventToEdit: VisitEvent | null;
  selectedDate: Date | null;
}

const DURATIONS: Duration[] = [20, 30, 40, 60, 90];

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, eventToEdit, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [selectedTime, setSelectedTime] = useState({ hour: 9, minute: 0 });
  const [duration, setDuration] = useState<Duration>(40);
  const [recurring, setRecurring] = useState<RecurringType>('none');
  const [memo, setMemo] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const initialDate = useMemo(() => eventToEdit ? new Date(eventToEdit.startDateTime) : selectedDate, [eventToEdit, selectedDate]);

  useEffect(() => {
    setShowDeleteConfirm(false); // Reset confirmation on open/change
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      const d = new Date(eventToEdit.startDateTime);
      setSelectedTime({ hour: d.getHours(), minute: d.getMinutes() });
      setDuration(eventToEdit.duration);
      setRecurring(eventToEdit.recurring);
      setMemo(eventToEdit.memo || '');
    } else if (selectedDate) {
      // Reset form for new event
      setTitle('');
      setSelectedTime({ hour: 9, minute: 0 });
      setDuration(40);
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
    if (eventToEdit?.recurring && eventToEdit.recurring !== 'none') {
      setShowDeleteConfirm(true);
    } else if (eventToEdit) {
      onDelete(eventToEdit.id, 'all', null);
    }
  }, [eventToEdit, onDelete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] sm:max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 sm:p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{eventToEdit ? '予定の編集' : '新しい予定'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow p-6 sm:p-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex flex-col items-center">
                <TimePicker initialHour={selectedTime.hour} initialMinute={selectedTime.minute} onTimeChange={setSelectedTime} />
            </div>

            <div>
              <label htmlFor="event-title" className="text-sm font-medium text-gray-700 mb-2 block">利用者名</label>
              <input
                id="event-title"
                type="text"
                placeholder="利用者名または訪問内容"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
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
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 sm:p-8 border-t border-gray-200">
          <div className="min-w-[200px]">
            {eventToEdit && (
                !showDeleteConfirm ? (
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                    削除
                </button>
                ) : (
                    <div className="flex items-center gap-2 text-sm">
                        <p className="font-semibold text-gray-700 mr-2">削除しますか？</p>
                        <button
                            onClick={() => onDelete(eventToEdit.id, 'single', selectedDate)}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                        >
                            この日のみ
                        </button>
                        <button
                            onClick={() => onDelete(eventToEdit.id, 'all', null)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            すべて
                        </button>
                    </div>
                )
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={showDeleteConfirm ? () => setShowDeleteConfirm(false) : onClose} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              {showDeleteConfirm ? '戻る' : 'キャンセル'}
            </button>
            <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!title || showDeleteConfirm}>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};