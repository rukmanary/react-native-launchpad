import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { readLanguage, type Language } from '../../core/storage/language';
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    language: readLanguage(),
  },
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
  },
});
export const { setLanguage } = preferencesSlice.actions;
const enhancer = __DEV__
  ? require('@rozenite/redux-devtools-plugin').rozeniteDevToolsEnhancer({
      name: 'Preferences',
      maxAge: 30,
      stateSanitizer: (state: unknown) => state,
      actionSanitizer: (action: { type: string }) => ({ type: action.type }),
    })
  : null;
export const store = configureStore({
  reducer: { preferences: preferencesSlice.reducer },
  enhancers: (getDefault) => (enhancer ? getDefault().concat(enhancer) : getDefault()),
});
export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
