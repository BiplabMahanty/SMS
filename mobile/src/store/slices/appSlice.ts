import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isInitialized: boolean;
  networkError: string | null;
}

const initialState: AppState = {
  isInitialized: false,
  networkError: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload;
    },
    setNetworkError(state, action: PayloadAction<string | null>) {
      state.networkError = action.payload;
    },
  },
});

export const { setInitialized, setNetworkError } = appSlice.actions;
export default appSlice.reducer;
