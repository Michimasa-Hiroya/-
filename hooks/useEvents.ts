import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { VisitEvent } from '../types';
import { useAuth } from './useAuth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<VisitEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const eventsCollectionRef = collection(db, 'visitEvents');
    const q = query(eventsCollectionRef, where('uid', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as VisitEvent[];
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'visitEvents');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addEvent = useCallback(async (eventData: Omit<VisitEvent, 'id' | 'uid'>) => {
    if (!db || !user) throw new Error("DB not initialized or user not logged in");
    
    const eventToAdd = {
        ...eventData,
        uid: user.uid,
    };

    try {
      await addDoc(collection(db, 'visitEvents'), eventToAdd);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'visitEvents');
    }
  }, [user]);

  const updateEvent = useCallback(async (eventData: VisitEvent, updateType: 'single' | 'future' | 'all' = 'all', originalDate?: Date) => {
    if (!db || !user) throw new Error("DB not initialized or user not logged in");
    
    const eventToModify = events.find(e => e.id === eventData.id);
    if (!eventToModify) return;

    try {
      if (updateType === 'single' && originalDate) {
        const originalTimestamp = new Date(originalDate);
        originalTimestamp.setHours(0, 0, 0, 0);
        const originalDateMs = originalTimestamp.getTime();

        const overriddenOccurrences = eventToModify.overriddenOccurrences ? [...eventToModify.overriddenOccurrences] : [];
        const existingIndex = overriddenOccurrences.findIndex(o => o.originalDate === originalDateMs);

        const newOverride = {
          originalDate: originalDateMs,
          startDateTime: eventData.startDateTime,
          duration: eventData.duration,
          memo: eventData.memo,
          title: eventData.title,
        };

        if (existingIndex > -1) {
          overriddenOccurrences[existingIndex] = newOverride;
        } else {
          overriddenOccurrences.push(newOverride);
        }

        const eventDocRef = doc(db, 'visitEvents', eventData.id);
        await updateDoc(eventDocRef, { overriddenOccurrences });

      } else if (updateType === 'future' && originalDate) {
        // 1. Set end date for the current event
        const newEndDate = new Date(originalDate);
        newEndDate.setDate(newEndDate.getDate() - 1);
        newEndDate.setHours(23, 59, 59, 999);
        
        const oldEventRef = doc(db, 'visitEvents', eventData.id);
        await updateDoc(oldEventRef, { endDate: newEndDate.getTime() });

        // 2. Create a new event starting from originalDate
        const { id, ...newEventData } = eventData;
        await addDoc(collection(db, 'visitEvents'), {
          ...newEventData,
          uid: user.uid,
          startDateTime: eventData.startDateTime, // This should be the new time on the originalDate
        });

      } else {
        // Update 'all' or non-recurring
        const eventDocRef = doc(db, 'visitEvents', eventData.id);
        const { id, uid, ...dataToUpdate } = eventData; // uidは変更不要なので除外
        
        if (dataToUpdate.recurring === 'none') {
            delete dataToUpdate.deletedOccurrences;
            delete dataToUpdate.overriddenOccurrences;
            delete dataToUpdate.endDate;
        }

        // 変更がある場合のみ更新（簡易的な比較）
        await updateDoc(eventDocRef, dataToUpdate);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `visitEvents/${eventData.id}`);
    }
  }, [events, user]);
  
  const deleteEvent = useCallback(async (eventId: string, deleteType: 'single' | 'future' | 'all', dateOfOccurrence: Date | null) => {
    if (!db || !user) throw new Error("DB not initialized or user not logged in");
    
    const eventToModify = events.find(e => e.id === eventId);
    if (!eventToModify) return;

    try {
      if (deleteType === 'single' && dateOfOccurrence) {
          const deletedOccurrences = eventToModify.deletedOccurrences ? [...eventToModify.deletedOccurrences] : [];
          const occurrenceTimestamp = new Date(dateOfOccurrence);
          occurrenceTimestamp.setHours(0, 0, 0, 0);
          if (!deletedOccurrences.includes(occurrenceTimestamp.getTime())) {
              deletedOccurrences.push(occurrenceTimestamp.getTime());
          }
          const eventDocRef = doc(db, 'visitEvents', eventId);
          await updateDoc(eventDocRef, { deletedOccurrences });

      } else if (deleteType === 'future' && dateOfOccurrence) {
          const newEndDate = new Date(dateOfOccurrence);
          newEndDate.setDate(newEndDate.getDate() - 1);
          newEndDate.setHours(23, 59, 59, 999);
          const eventDocRef = doc(db, 'visitEvents', eventId);
          await updateDoc(eventDocRef, { endDate: newEndDate.getTime() });

      } else if (deleteType === 'all') {
          await deleteDoc(doc(db, 'visitEvents', eventId));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `visitEvents/${eventId}`);
    }
  }, [events, user]);

  return { events, loading, addEvent, updateEvent, deleteEvent };
};
