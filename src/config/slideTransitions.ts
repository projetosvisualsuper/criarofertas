import { ArrowRight, Maximize2, RotateCcw, Zap, Eye } from 'lucide-react';

export const SLIDE_TRANSITION_PRESETS = [
  {
    id: 'slide-in',
    name: 'Deslizar (Padrão)',
    icon: ArrowRight,
    className: 'animate-slide-in',
  },
  {
    id: 'fade',
    name: 'Desvanecer',
    icon: Eye,
    className: 'animate-fade-in',
  },
  {
    id: 'zoom-in',
    name: 'Zoom Suave',
    icon: Maximize2,
    className: 'animate-zoom-in',
  },
  {
    id: 'rotate-scale',
    name: 'Giro e Escala',
    icon: RotateCcw,
    className: 'animate-rotate-scale',
  },
  {
    id: 'none',
    name: 'Nenhuma',
    icon: Zap,
    className: '',
  },
] as const;

export type SlideTransitionId = typeof SLIDE_TRANSITION_PRESETS[number]['id'];