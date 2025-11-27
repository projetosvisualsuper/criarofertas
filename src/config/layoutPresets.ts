import { PosterTheme } from '../types';

// This file defines the default layout settings that are automatically applied
// when a user selects a new poster format. This ensures that elements like
// headers, footers, and product grids are optimized for the chosen aspect ratio.

type LayoutPreset = Partial<Pick<PosterTheme, 'layoutCols' | 'headerTitle' | 'headerSubtitle' | 'footerText'>>;

export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  'a4': {
    layoutCols: 2,
    headerTitle: { text: 'SUPER OFERTAS', x: 0, y: 0, scale: 1 },
    headerSubtitle: { text: 'SÓ HOJE', x: 0, y: 0, scale: 1 },
    footerText: { text: 'Ofertas válidas enquanto durarem os estoques', x: 0, y: 0, scale: 1 },
  },
  'story': {
    layoutCols: 2,
    headerTitle: { text: 'SUPER OFERTAS', x: 0, y: 0, scale: 1.1 },
    headerSubtitle: { text: 'SÓ HOJE', x: 0, y: 0, scale: 1.1 },
    footerText: { text: 'Ofertas válidas enquanto durarem os estoques', x: 0, y: 0, scale: 1 },
  },
  'feed': {
    layoutCols: 2,
    headerTitle: { text: 'SUPER OFERTAS', x: 0, y: 0, scale: 1 },
    headerSubtitle: { text: 'SÓ HOJE', x: 0, y: 0, scale: 1 },
    footerText: { text: 'Ofertas válidas enquanto durarem os estoques', x: 0, y: 0, scale: 1 },
  },
  'tv': {
    layoutCols: 3,
    headerTitle: { text: 'SUPER OFERTAS', x: 0, y: 0, scale: 0.9 },
    headerSubtitle: { text: 'SÓ HOJE', x: 0, y: 0, scale: 0.9 },
    footerText: { text: 'Ofertas válidas enquanto durarem os estoques', x: 0, y: 0, scale: 1 },
  },
};