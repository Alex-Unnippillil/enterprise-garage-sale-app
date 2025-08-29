import { useCallback, useEffect, useRef, useState } from 'react';
import { GamepadInput, GamepadProfile, DEFAULT_PROFILE } from '../input/gamepad';

const STORAGE_KEY = (gameId: string) => `gamepad.profile.${gameId}`;

export function useGamepad(gameId: string, initialProfile: GamepadProfile = DEFAULT_PROFILE) {
  const [profile, setProfile] = useState<GamepadProfile>(initialProfile);
  const gpRef = useRef<GamepadInput>();

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY(gameId));
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, [gameId]);

  useEffect(() => {
    const gp = new GamepadInput(profile);
    gp.start();
    gpRef.current = gp;
    return () => gp.stop();
  }, [profile]);

  const remap = useCallback(
    (newProfile: GamepadProfile) => {
      setProfile(newProfile);
      window.localStorage.setItem(STORAGE_KEY(gameId), JSON.stringify(newProfile));
      gpRef.current?.remap(newProfile);
    },
    [gameId],
  );

  const on = useCallback((action: string, handler: EventListener) => {
    gpRef.current?.on(action, handler);
  }, []);

  const off = useCallback((action: string, handler: EventListener) => {
    gpRef.current?.off(action, handler);
  }, []);

  return { on, off, remap, profile };
}
