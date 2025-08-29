import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PreferencesState {
  highContrast: boolean;
  largeTargets: boolean;
  reduceMotion: boolean;
}

const initialState: PreferencesState = {
  highContrast: false,
  largeTargets: false,
  reduceMotion: false,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggleHighContrast(state) {
      state.highContrast = !state.highContrast;
    },
    toggleLargeTargets(state) {
      state.largeTargets = !state.largeTargets;
    },
    toggleReduceMotion(state) {
      state.reduceMotion = !state.reduceMotion;
    },
    setPreferences(state, action: PayloadAction<Partial<PreferencesState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { toggleHighContrast, toggleLargeTargets, toggleReduceMotion, setPreferences } =
  preferencesSlice.actions;

export default preferencesSlice.reducer;
