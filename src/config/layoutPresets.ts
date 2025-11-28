import { HeaderElement } from '../types';

// This file defines layout overrides that are automatically applied
// when a user selects a new poster format.

interface LayoutPreset {
  layoutCols: number;
  headerTitle?: Partial<HeaderElement>;
  headerSubtitle?: Partial<HeaderElement>;
  footerText?: Partial<HeaderElement>;
}

export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  'a4': {
    layoutCols: 2,
  },
  'story': {
    layoutCols: 2,
    headerTitle: { scale: 1.1 },
    headerSubtitle: { scale: 1.1 },
  },
  'feed': {
    layoutCols: 2,
  },
  'tv': {
    layoutCols: 3,
    headerTitle: { scale: 0.9 },
    headerSubtitle: { scale: 0.9 },
  },
};