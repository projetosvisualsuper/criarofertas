import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar o estado persistente no localStorage.
 * @param key A chave a ser usada no localStorage.
 * @param defaultValue O valor padrão se não houver nada no localStorage.
 * @returns [state, setState]
 */
export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        try {
          return JSON.parse(storedValue) as T;
        } catch (e) {
          console.error(`Error parsing localStorage key "${key}":`, e);
          return defaultValue;
        }
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState] as const;
}