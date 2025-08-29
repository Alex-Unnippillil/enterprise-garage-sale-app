'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { setPreferences } from '@/state/preferences';

const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((state) => state.preferences);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('preferences') : null;
    if (stored) {
      dispatch(setPreferences(JSON.parse(stored)));
    } else {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      dispatch(setPreferences({ reduceMotion: prefersReduced }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('preferences', JSON.stringify(prefs));
    const root = document.documentElement;
    root.dataset.highContrast = String(prefs.highContrast);
    root.dataset.largeTargets = String(prefs.largeTargets);
    root.dataset.reduceMotion = String(prefs.reduceMotion);
  }, [prefs]);

  return <>{children}</>;
};

export default PreferencesProvider;
