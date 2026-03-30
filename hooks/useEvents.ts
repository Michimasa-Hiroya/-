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
  const { user, isGuest } = useAuth();
  const [events, setEvents] = useState<VisitEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper for guest mode localStorage
  const getGuestEvents = (): VisitEvent[] => {
    const stored = localStorage.getItem('guestEvents');
    return stored ? JSON.parse(stored) : [];
  };

  const setGuestEvents = (newEvents: VisitEvent[]) => {
    localStorage.setItem('guestEvents', JSON.stringify(newEvents));
    setEvents(newEvents);
  };

  useEffect(() => {
    if (isGuest) {
      setEvents(getGuestEvents());
      setLoading(false);
      return;
    }

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
  }, [user, isGuest]);

  const addEvent = useCallback(async (eventData: Omit<VisitEvent, 'id' | 'uid'>) => {
    if (isGuest) {
      const guestEvents = getGuestEvents();
      const newEvent: VisitEvent = {
        ...eventData,
        id: `guest_${Date.now()}`,
        uid: 'guest_user',
      };
      setGuestEvents([...guestEvents, newEvent]);
      return;
    }

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
  }, [user, isGuest]);

  const updateEvent = useCallback(async (eventData: VisitEvent, updateType: 'single' | 'future' | 'all' = 'all', originalDate?: Date) => {
    if (isGuest) {
      const guestEvents = getGuestEvents();
      const eventToModify = guestEvents.find(e => e.id === eventData.id);
      if (!eventToModify) return;

      let updatedEvents = [...guestEvents];

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

        const index = updatedEvents.findIndex(e => e.id === eventData.id);
        updatedEvents[index] = { ...eventToModify, overriddenOccurrences };

      } else if (updateType === 'future' && originalDate) {
        const newEndDate = new Date(originalDate);
        newEndDate.setDate(newEndDate.getDate() - 1);
        newEndDate.setHours(23, 59, 59, 999);
        
        const index = updatedEvents.findIndex(e => e.id === eventData.id);
        updatedEvents[index] = { ...eventToModify, endDate: newEndDate.getTime() };

        const { id, ...newEventData } = eventData;
        const newEvent: VisitEvent = {
          ...newEventData,
          id: `guest_${Date.now()}`,
          uid: 'guest_user',
          startDateTime: eventData.startDateTime,
        };
        updatedEvents.push(newEvent);

      } else {
        const index = updatedEvents.findIndex(e => e.id === eventData.id);
        const { id, uid, ...dataToUpdate } = eventData;
        
        let finalData = { ...eventToModify, ...dataToUpdate };
        if (dataToUpdate.recurring === 'none') {
            delete finalData.deletedOccurrences;
            delete finalData.overriddenOccurrences;
            delete finalData.endDate;
        }
        updatedEvents[index] = finalData;
      }

      setGuestEvents(updatedEvents);
      return;
    }

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
        const newEndDate = new Date(originalDate);
        newEndDate.setDate(newEndDate.getDate() - 1);
        newEndDate.setHours(23, 59, 59, 999);
        
        const oldEventRef = doc(db, 'visitEvents', eventData.id);
        await updateDoc(oldEventRef, { endDate: newEndDate.getTime() });

        const { id, ...newEventData } = eventData;
        await addDoc(collection(db, 'visitEvents'), {
          ...newEventData,
          uid: user.uid,
          startDateTime: eventData.startDateTime,
        });

      } else {
        const eventDocRef = doc(db, 'visitEvents', eventData.id);
        const { id, uid, ...dataToUpdate } = eventData;
        
        if (dataToUpdate.recurring === 'none') {
            delete dataToUpdate.deletedOccurrences;
            delete dataToUpdate.overriddenOccurrences;
            delete dataToUpdate.endDate;
        }

        await updateDoc(eventDocRef, dataToUpdate);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `visitEvents/${eventData.id}`);
    }
  }, [events, user, isGuest]);
  
  const deleteEvent = useCallback(async (eventId: string, deleteType: 'single' | 'future' | 'all', dateOfOccurrence: Date | null) => {
    if (isGuest) {
      const guestEvents = getGuestEvents();
      const eventToModify = guestEvents.find(e => e.id === eventId);
      if (!eventToModify) return;

      let updatedEvents = [...guestEvents];

      if (deleteType === 'single' && dateOfOccurrence) {
          const deletedOccurrences = eventToModify.deletedOccurrences ? [...eventToModify.deletedOccurrences] : [];
          const occurrenceTimestamp = new Date(dateOfOccurrence);
          occurrenceTimestamp.setHours(0, 0, 0, 0);
          if (!deletedOccurrences.includes(occurrenceTimestamp.getTime())) {
              deletedOccurrences.push(occurrenceTimestamp.getTime());
          }
          const index = updatedEvents.findIndex(e => e.id === eventId);
          updatedEvents[index] = { ...eventToModify, deletedOccurrences };

      } else if (deleteType === 'future' && dateOfOccurrence) {
          const newEndDate = new Date(dateOfOccurrence);
          newEndDate.setDate(newEndDate.getDate() - 1);
          newEndDate.setHours(23, 59, 59, 999);
          const index = updatedEvents.findIndex(e => e.id === eventId);
          updatedEvents[index] = { ...eventToModify, endDate: newEndDate.getTime() };

      } else if (deleteType === 'all') {
          updatedEvents = updatedEvents.filter(e => e.id !== eventId);
      }

      setGuestEvents(updatedEvents);
      return;
    }

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
  }, [events, user, isGuest]);

  return { events, loading, addEvent, updateEvent, deleteEvent };
};
