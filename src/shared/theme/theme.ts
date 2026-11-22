import { createContext, createElement, useContext, type PropsWithChildren } from 'react';

const lightColors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#E9EDF5',
  text: '#172338',
  muted: '#4A5A70',
  primary: '#2358C5',
  primaryText: '#FFFFFF',
  primaryMuted: '#E1EAFF',
  danger: '#B42318',
  dangerText: '#FFFFFF',
  border: '#CDD5E0',
  success: '#14734B',
  warning: '#92540A',
  overlay: 'rgba(12, 21, 38, 0.52)',
  disabled: '#ADB8C9',
  shadow: '#10203A',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radii = { md: 12, lg: 16, pill: 999 };

export type AppTheme = {
  mode: 'light' | 'dark';
  colors: Readonly<typeof lightColors>;
  spacing: Readonly<typeof spacing>;
  radii: Readonly<typeof radii>;
};

export const lightTheme: AppTheme = { mode: 'light', colors: lightColors, spacing, radii };

export const darkTheme: AppTheme = {
  mode: 'dark',
  spacing,
  radii,
  colors: {
    background: '#111827',
    surface: '#1B2537',
    surfaceMuted: '#29354A',
    text: '#F0F4FA',
    muted: '#ABB9CF',
    primary: '#A6C3FF',
    primaryText: '#112B5D',
    primaryMuted: '#243E6D',
    danger: '#FFB2A8',
    dangerText: '#551C17',
    border: '#46536A',
    success: '#80DCB1',
    warning: '#F4C57C',
    overlay: 'rgba(0, 0, 0, 0.65)',
    disabled: '#53627A',
    shadow: '#000000',
  },
};

export const colors = lightTheme.colors;

const ThemeContext = createContext(lightTheme);

export const ThemeProvider = ({ theme, children }: PropsWithChildren<{ theme: AppTheme }>) =>
  createElement(ThemeContext.Provider, { value: theme }, children);

export const useTheme = () => useContext(ThemeContext);
