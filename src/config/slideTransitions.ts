import { ArrowRight, Maximize2, RotateCcw, Zap, Eye, Layers } from 'lucide-react';

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
    id: 'stagger-fade',
    name: 'Escalonado (Fade)',
    icon: Layers,
    className: 'stagger-fade-active', // Usaremos esta classe para ativar a animação nos filhos
  },
  {
    id: 'none',
    name: 'Nenhuma',
    icon: Zap,
    className: '',
  },
] as const;

export type SlideTransitionId = typeof SLIDE_TRANSITION_PRESETS[number]['id'];