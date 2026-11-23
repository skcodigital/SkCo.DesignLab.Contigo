import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type Forma =
  | { t: 'path'; d: string }
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx: number };

interface DefIcono {
  tam: number;
  grosor: number;
  formas: readonly Forma[];
}

const p = (d: string): Forma => ({ t: 'path', d });
const circulo = (cx: number, cy: number, r: number): Forma => ({ t: 'circle', cx, cy, r });
const rect = (x: number, y: number, w: number, h: number, rx: number): Forma => ({ t: 'rect', x, y, w, h, rx });

/** Íconos de trazo del prototipo (los del objeto `IC` del journey y los del markup de Planeación Pro). */
const ICONOS = {
  check: { tam: 14, grosor: 3, formas: [p('M20 6 9 17l-5-5')] },
  info: { tam: 16, grosor: 2, formas: [circulo(12, 12, 10), p('M12 16v-4'), p('M12 8h.01')] },
  off: { tam: 14, grosor: 2, formas: [circulo(12, 12, 10), p('m4.9 4.9 14.2 14.2')] },
  balanza: {
    tam: 16, grosor: 2,
    formas: [p('M12 3v18M5 7h14M7 21h10'), p('m5 7-3 7a3 3 0 0 0 6 0Z'), p('m19 7-3 7a3 3 0 0 0 6 0Z')],
  },
  bajar: { tam: 14, grosor: 2.2, formas: [p('M12 3v12M7 10l5 5 5-5M5 21h14')] },
  clip: {
    tam: 16, grosor: 2.2,
    formas: [rect(8, 2, 8, 4, 1), p('M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'), p('m9 14 2 2 4-4')],
  },
  ok: { tam: 16, grosor: 2.6, formas: [p('m5 12 5 5 9-10')] },
  lapiz: { tam: 14, grosor: 2, formas: [p('M12 20h9'), p('M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z')] },
  sube: { tam: 16, grosor: 2, formas: [p('m22 7-8.5 8.5-5-5L2 17'), p('M16 7h6v6')] },
  alerta: {
    tam: 16, grosor: 2,
    formas: [p('m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'), p('M12 9v4'), p('M12 17h.01')],
  },
  escudo: {
    tam: 16, grosor: 2,
    formas: [
      p('M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'),
      p('m9 12 2 2 4-4'),
    ],
  },
  cal: { tam: 16, grosor: 2, formas: [rect(3, 4, 18, 18, 2), p('M16 2v4M8 2v4M3 10h18')] },
  ext: {
    tam: 14, grosor: 2,
    formas: [p('M15 3h6v6'), p('M10 14 21 3'), p('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6')],
  },
  chev: { tam: 18, grosor: 2, formas: [p('m9 18 6-6-6-6')] },
  flecha: { tam: 16, grosor: 2.4, formas: [p('M5 12h14M13 6l6 6-6 6')] },
  regresar: { tam: 18, grosor: 2.2, formas: [p('M19 12H5M12 19l-7-7 7-7')] },
  candado: { tam: 12, grosor: 2.4, formas: [rect(3, 11, 18, 11, 2), p('M7 11V7a5 5 0 0 1 10 0v4')] },
  prohibido: { tam: 16, grosor: 2.2, formas: [circulo(12, 12, 10), p('m4.9 4.9 14.2 14.2')] },
  panel: { tam: 16, grosor: 2, formas: [rect(3, 3, 18, 18, 2), p('M15 3v18')] },
  enviar: { tam: 16, grosor: 2.2, formas: [p('M22 2 11 13'), p('m22 2-7 20-4-9-9-4Z')] },
  copiar: {
    tam: 14, grosor: 2,
    formas: [rect(9, 9, 13, 13, 2), p('M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1')],
  },
  cerrar: { tam: 18, grosor: 2.2, formas: [p('M18 6 6 18M6 6l12 12')] },
  radar: {
    tam: 20, grosor: 2,
    formas: [
      p('M19.07 4.93A10 10 0 0 0 6.99 3.34'), p('M4 6h.01'), p('M2.29 9.62A10 10 0 1 0 21.31 8.35'),
      p('M16.24 7.76A6 6 0 1 0 8.23 16.67'), p('M12 18h.01'), p('M17.99 11.66A6 6 0 0 1 15.77 16.67'),
      circulo(12, 12, 2), p('m13.41 10.59 5.66-5.66'),
    ],
  },
} as const satisfies Record<string, DefIcono>;

export type NombreIcono = keyof typeof ICONOS;

/**
 * Ícono SVG de trazo. Se usa como atributo del propio `<svg>` (`<svg ncIcono="info"></svg>`) para que los estilos
 * del componente que lo pinta (p. ej. `.jw-aviso svg{…}`) sigan aplicando como en el prototipo.
 */
@Component({
  selector: 'svg[ncIcono]',
  template: `
    @for (f of def().formas; track $index) {
      @switch (f.t) {
        @case ('path') { <svg:path [attr.d]="f.d" /> }
        @case ('circle') { <svg:circle [attr.cx]="f.cx" [attr.cy]="f.cy" [attr.r]="f.r" /> }
        @case ('rect') { <svg:rect [attr.x]="f.x" [attr.y]="f.y" [attr.width]="f.w" [attr.height]="f.h" [attr.rx]="f.rx" /> }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    '[attr.width]': 'tam() ?? def().tam',
    '[attr.height]': 'tam() ?? def().tam',
    '[attr.stroke-width]': 'grosor() ?? def().grosor',
  },
})
export class Icono {
  readonly ncIcono = input.required<NombreIcono>();
  readonly tam = input<number>();
  readonly grosor = input<number>();

  protected readonly def = computed<DefIcono>(() => ICONOS[this.ncIcono()]);
}
