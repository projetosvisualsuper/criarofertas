import { PanelLeft, PanelTop, AlignCenterHorizontal, PanelRight } from 'lucide-react';

export const HEADER_LAYOUT_PRESETS = [
  {
    id: 'logo-left',
    name: 'Logo à Esquerda',
    icon: PanelLeft,
  },
  {
    id: 'logo-top',
    name: 'Logo Acima',
    icon: PanelTop,
  },
  {
    id: 'text-only',
    name: 'Apenas Texto',
    icon: AlignCenterHorizontal,
  },
  {
    id: 'logo-right',
    name: 'Logo à Direita',
    icon: PanelRight,
  },
] as const; // Use "as const" for stricter typing

export type HeaderLayoutId = typeof HEADER_LAYOUT_PRESETS[number]['id'];