import React, { useState, useEffect, useCallback } from 'react';

// IndexedDB setup
const DB_NAME = 'VisitNurseScheduleDB';
const STORE_NAME = 'AppSettings';
const DB_VERSION = 1;

// A promise that resolves with the DB connection.
// This is created once and reused.
let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject('IndexedDB is not supported by this browser.');
                return;
            }
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME); // Simple key-value store
                }
            };
        });
    }
    return dbPromise;
};

const getFromDb = async <T,>(key: IDBValidKey): Promise<T | undefined> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as T | undefined);
    });
};

const setToDb = async (key: IDBValidKey, value: any): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

// The hook implementation - keeps the same signature as the original useLocalStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // Effect to load the value from IndexedDB on mount
    useEffect(() => {
        let isMounted = true;
        getFromDb<T>(key).then(value => {
            if (isMounted) {
                if (value !== undefined && value !== null) {
                    setStoredValue(value);
                } else {
                    // If no value in DB, use initialValue and write it back to DB
                    setStoredValue(initialValue);
                    setToDb(key, initialValue).catch(err => console.error("Failed to initialize value in DB", err));
                }
            }
        }).catch(error => {
            console.error(`Failed to get value for key "${key}" from IndexedDB. Falling back to initialValue.`, error);
            if (isMounted) {
                setStoredValue(initialValue);
            }
        });

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            setToDb(key, valueToStore).catch(error => {
                console.error(`Failed to set value for key "${key}" to IndexedDB.`, error);
            });
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
}
