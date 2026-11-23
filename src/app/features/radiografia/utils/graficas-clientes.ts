// Cálculos puros de las gráficas de Clientes (pares nuevos/perdidos, productos, dona y edad).
import { AnioEvolucion } from '@features/radiografia/interfaces/clientes';
import { pct, signo } from '@features/radiografia/utils/formato';

export const NOMBRES_SEGMENTO: readonly string[] = ['Finanzas Personales', 'Privilegio', 'Elite', 'Wealth'];
export const COLORES_SEGMENTO: readonly string[] = [
  'var(--charts-c18)',
  'var(--sk-charts-c01)',
  'var(--sk-charts-c04)',
  'var(--charts-c08)',
];
export const RANGOS_EDAD: readonly string[] = ['18–30', '31–45', '46–60', 'Más de 60'];
export const NOMBRES_PRODUCTOS: readonly string[] = [
  '1 producto (1P)',
  '2 productos (2P)',
  '3 productos (3P)',
  '4 productos o más (4P+)',
];

export interface ParVm {
  readonly anio: string;
  readonly nuevos: number;
  readonly perdidos: number;
  readonly altoNuevos: number;
  readonly altoPerdidos: number;
  readonly neto: string;
  readonly claseNeto: '' | 'neto-neg' | 'neto-cero';
  readonly aria: string;
}

/** Pares de barras nuevos/perdidos: alto proporcional al máximo (170 px), con un mínimo visible. */
export function paresEvolucion(anios: readonly AnioEvolucion[], minimo = 8, alto = 170): ParVm[] {
  const max = Math.max(...anios.flatMap((a) => [a.nuevos, a.perdidos]));
  const h = (v: number): number => Math.max(minimo, Math.round((v / (max || 1)) * alto));
  return anios.map(({ anio, nuevos, perdidos }) => {
    const n = nuevos - perdidos;
    return {
      anio,
      nuevos,
      perdidos,
      altoNuevos: h(nuevos),
      altoPerdidos: h(perdidos),
      neto: 'Neto ' + signo(n),
      claseNeto: n < 0 ? 'neto-neg' : n === 0 ? 'neto-cero' : '',
      aria: `${anio}: ${nuevos} nuevos, ${perdidos} perdidos, neto ${signo(n)}`,
    };
  });
}

/** Porcentaje con hasta un decimal en es-CO ("13,7%"), como el tooltip de las barras apiladas. */
export function pctAncho(ancho: number): string {
  return ancho.toLocaleString('es-CO', { maximumFractionDigits: 1 }) + '%';
}

export interface TramoProductoVm {
  readonly clase: string;
  readonly nombre: string;
  readonly n: number;
  readonly pct: number;
  /** El % se pinta dentro del tramo solo si mide 10% o más. */
  readonly conValor: boolean;
  readonly claro: boolean;
}

/** Productos por cliente: tramos de la barra (p1…p4) y su lista. */
export function tramosProductos(conteos: readonly number[], total: number): TramoProductoVm[] {
  return conteos.map((n, i) => {
    const p = pct(n, total);
    return { clase: 'p' + (i + 1), nombre: NOMBRES_PRODUCTOS[i], n, pct: p, conValor: p >= 10, claro: i === 2 };
  });
}

/** "42%" / "48,3%": clientes con 2 o más productos (un decimal si lo hay). */
export function pctDosOMas(conteos: readonly number[], total: number): string {
  return (Math.round(((total - conteos[0]) / total) * 1000) / 10).toString().replace('.', ',') + '%';
}

export function ariaProductos(tramos: readonly TramoProductoVm[]): string {
  const [a, b, c, d] = tramos.map((t) => t.pct);
  return `1 producto ${a}%, 2 productos ${b}%, 3 productos ${c}%, 4 o más ${d}%.`;
}

export interface SegmentoDonaVm {
  readonly nombre: string;
  readonly color: string;
  readonly n: number;
  readonly pct: number;
  readonly dash: string;
  readonly offset: string;
  readonly tip: string;
}

/** Circunferencia de la dona (r = 70). */
export const CIRCUNFERENCIA_DONA = 2 * Math.PI * 70;

/** Dona de segmentos: largo de cada arco y su desplazamiento. */
export function segmentosDona(valores: readonly number[], total: number): SegmentoDonaVm[] {
  const C = CIRCUNFERENCIA_DONA;
  let off = 0;
  return valores.map((n, i) => {
    const L = (n / total) * C;
    const p = pct(n, total);
    const vm: SegmentoDonaVm = {
      nombre: NOMBRES_SEGMENTO[i],
      color: COLORES_SEGMENTO[i],
      n,
      pct: p,
      dash: L.toFixed(2) + ' ' + (C - L).toFixed(2),
      offset: (-off).toFixed(2),
      tip: `${NOMBRES_SEGMENTO[i]}: ${n} ${n === 1 ? 'cliente' : 'clientes'} · ${p}%`,
    };
    off += L;
    return vm;
  });
}

export function ariaDona(segs: readonly SegmentoDonaVm[]): string {
  return 'Clientes por segmento: ' + segs.map((s) => (s.n ? `${s.nombre} ${s.n} (${s.pct}%)` : `${s.nombre} 0`)).join(', ') + '.';
}

export interface BarraEdadVm {
  readonly rango: string;
  readonly n: number;
  readonly alto: number;
  readonly tip: string;
  readonly aria: string;
}

/** Barras por rango de edad: alto proporcional al máximo (180 px). */
export function barrasEdad(valores: readonly number[], total: number, alto = 180): BarraEdadVm[] {
  const max = Math.max(...valores) || 1;
  return valores.map((n, i) => ({
    rango: RANGOS_EDAD[i],
    n,
    alto: Math.round((n / max) * alto),
    tip: `${n} clientes · ${pct(n, total)}%`,
    aria: `${i === 3 ? 'Más de 60' : RANGOS_EDAD[i]} años: ${n} clientes`,
  }));
}
