import { HeaderElement } from '../types';

// This file defines layout overrides that are automatically applied
// when a user selects a new poster format.

interface LayoutPreset {
  layoutCols: number;
}

export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  'a4': {
    layoutCols: 2,
  },
  'story': {
    layoutCols: 2,
  },
  'feed': {
    layoutCols: 2,
  },
  'tv': {
    layoutCols: 3,
  },
};