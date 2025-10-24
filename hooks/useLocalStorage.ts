import { useState, useEffect } from 'react';

function getValue<T>(key: string, initialValue: T | (() => T)) {
    const item = localStorage.getItem(key);
    if (item !== null) {
        try {
            return JSON.parse(item);
        } catch (e) {
            console.error(`Error parsing JSON from localStorage key "${key}":`, e);
        }
    }
    
    if (initialValue instanceof Function) {
        return initialValue();
    }
    return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
    const [value, setValue] = useState<T>(() => {
        return getValue(key, initialValue);
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error setting localStorage key "${key}":`, e);
        }
    }, [key, value]);
    
    return [value, setValue] as const;
}