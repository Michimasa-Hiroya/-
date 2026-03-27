import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VisitEvent, RecurringType, Duration } from '../types';
import { TimePicker } from './TimePicker';
import { TrashIcon, XMarkIcon } from './Icons';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: VisitEvent, updateType: 'single' | 'future' | 'all', originalDate?: Date) => void;
  onDelete: (eventId: string, deleteType: 'single' | 'future' | 'all', dateOfOccurrence: Date | null) => void;
  eventToEdit: VisitEvent | null;
  selectedDate: Date | null;
}

const DURATIONS: Duration[] = [20, 30, 40, 60, 90];

export const EventModal = ({ isOpen, onClose, onSave, onDelete, eventToEdit, selectedDate }: EventModalProps) => {
  const [title, setTitle] = useState('');
  const [selectedTime, setSelectedTime] = useState({ hour: 9, minute: 0 });
  const [duration, setDuration] = useState<Duration>(40);
  const [recurring, setRecurring] = useState<RecurringType>('none');
  const [memo, setMemo] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  
  const initialDate = useMemo(() => eventToEdit ? new Date(eventToEdit.startDateTime) : selectedDate, [eventToEdit, selectedDate]);

  useEffect(() => {
    setShowDeleteConfirm(false);
    setShowUpdateConfirm(false);
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      // When editing, use the time from the event, but the date from the selected occurrence
      const eventTime = new Date(eventToEdit.startDateTime);
      setSelectedTime({ hour: eventTime.getHours(), minute: eventTime.getMinutes() });
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
  
  const handleSave = useCallback((updateType: 'single' | 'future' | 'all' = 'all') => {
    const dateForSaving = (recurring !== 'none' && eventToEdit && updateType === 'all') ? new Date(eventToEdit.startDateTime) : selectedDate;

    if (!title || !dateForSaving) return;

    const startDateTime = new Date(dateForSaving);
    startDateTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0);

    const eventData: VisitEvent = {
      ...eventToEdit,
      id: eventToEdit?.id || Date.now().toString(),
      title,
      startDateTime: startDateTime.getTime(),
      duration,
      recurring,
      memo,
    };
    onSave(eventData, updateType, selectedDate || undefined);
    setShowUpdateConfirm(false);
  }, [title, selectedDate, selectedTime, duration, recurring, memo, eventToEdit, onSave]);

  const handleSaveClick = useCallback(() => {
    if (eventToEdit?.recurring && eventToEdit.recurring !== 'none') {
      setShowUpdateConfirm(true);
    } else {
      handleSave('all');
    }
  }, [eventToEdit, handleSave]);

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
          {showUpdateConfirm ? (
            <div className="space-y-6 text-center py-4">
              <h3 className="text-xl font-bold text-gray-800">変更の適用範囲</h3>
              <p className="text-gray-600">この変更をどのように適用しますか？</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleSave('single')}
                  className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-colors"
                >
                  この日のみ変更
                </button>
                <button
                  onClick={() => handleSave('future')}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                  この日とそれ以降を変更
                </button>
                <button
                  onClick={() => handleSave('all')}
                  className="w-full py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors"
                >
                  すべて変更
                </button>
              </div>
            </div>
          ) : showDeleteConfirm ? (
            <div className="space-y-6 text-center py-4">
              <h3 className="text-xl font-bold text-red-600">削除の確認</h3>
              <p className="text-gray-600">どの範囲の予定を削除しますか？</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onDelete(eventToEdit!.id, 'single', selectedDate)}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-200"
                >
                  この日のみ削除
                </button>
                <button
                  onClick={() => onDelete(eventToEdit!.id, 'future', selectedDate)}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  この日とそれ以降を削除
                </button>
                <button
                  onClick={() => onDelete(eventToEdit!.id, 'all', selectedDate)}
                  className="w-full py-3 bg-red-700 text-white rounded-xl font-bold hover:bg-red-800 transition-colors"
                >
                  すべて削除
                </button>
              </div>
            </div>
          ) : (
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
        )}
      </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 sm:p-8 border-t border-gray-200">
          <div className="flex-grow">
            {eventToEdit && !showDeleteConfirm && !showUpdateConfirm && (
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
            <button onClick={showDeleteConfirm || showUpdateConfirm ? () => { setShowDeleteConfirm(false); setShowUpdateConfirm(false); } : onClose} className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              {showDeleteConfirm || showUpdateConfirm ? '戻る' : 'キャンセル'}
            </button>
            {!showDeleteConfirm && !showUpdateConfirm && (
              <button onClick={handleSaveClick} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!title}>
                保存
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};