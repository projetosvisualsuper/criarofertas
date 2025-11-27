import { PosterTheme } from '../types';

// This file defines complete visual themes that can be applied with a single click.
// Each preset contains a harmonious set of colors and styles.

export interface ThemePreset {
  id: string;
  name: string;
  theme: Partial<PosterTheme>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'classic-red',
    name: 'Clássico Vermelho',
    theme: {
      primaryColor: '#dc2626', // red-600
      secondaryColor: '#fbbf24', // amber-400
      backgroundColor: '#ffffff',
      textColor: '#1f2937', // gray-800
      priceCardStyle: 'default',
      priceCardBackgroundColor: '#ffffff',
      priceCardTextColor: '#dc2626',
    },
  },
  {
    id: 'modern-blue',
    name: 'Moderno Azul',
    theme: {
      primaryColor: '#2563eb', // blue-600
      secondaryColor: '#10b981', // emerald-500
      backgroundColor: '#f9fafb', // gray-50
      textColor: '#111827', // gray-900
      priceCardStyle: 'minimal',
      priceCardBackgroundColor: 'transparent',
      priceCardTextColor: '#2563eb',
    },
  },
  {
    id: 'elegant-dark',
    name: 'Elegante Escuro',
    theme: {
      primaryColor: '#1f2937', // gray-800
      secondaryColor: '#d97706', // amber-600
      backgroundColor: '#111827', // gray-900
      textColor: '#f9fafb', // gray-50
      priceCardStyle: 'pill',
      priceCardBackgroundColor: '#374151', // gray-700
      priceCardTextColor: '#f59e0b', // amber-500
    },
  },
  {
    id: 'natural-green',
    name: 'Natural Verde',
    theme: {
      primaryColor: '#166534', // green-800
      secondaryColor: '#ca8a04', // yellow-600
      backgroundColor: '#f0fdf4', // green-50
      textColor: '#14532d', // green-900
      priceCardStyle: 'default',
      priceCardBackgroundColor: '#ffffff',
      priceCardTextColor: '#166534',
    },
  },
];