'use client';

import { useCallback, useEffect, useState } from 'react';

type PlaceholderData = unknown;

export function usePlaceholderSync() {
  const [data, setData] = useState<PlaceholderData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isSupported, setIsSupported] = useState(true);

  const manualSync = useCallback(async () => {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      const json = await res.json();
      setData(json);
      setError(null);
      return json;
    } catch (err) {
      setError(err);
      return null;
    }
  }, []);

  useEffect(() => {
    let messageHandler: ((event: MessageEvent) => void) | null = null;

    async function register() {
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        setIsSupported(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        if ('periodicSync' in registration) {
          try {
            await registration.periodicSync.register('placeholder-sync', {
              minInterval: 24 * 60 * 60 * 1000,
            });
          } catch {
            setIsSupported(false);
          }
        } else {
          setIsSupported(false);
        }

        messageHandler = (event: MessageEvent) => {
          if (event.data?.type === 'placeholder-sync') {
            setData(event.data.data);
          }
        };
        navigator.serviceWorker.addEventListener('message', messageHandler);
      } catch {
        setIsSupported(false);
      }
    }

    register();

    return () => {
      if (messageHandler && typeof navigator !== 'undefined') {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      }
    };
  }, []);

  return { data, error, isSupported, manualSync };
}
