import { TEXTOS_DETALLE } from '../constants/textos';
import { Calculo } from '../interfaces/calculo';
import { Contrato } from '../interfaces/contrato';
import { pesos } from './formato';

export type EstadoAporte = 'ex' | 'sr' | 'cc';

/** Aporte ficticio de la tabla de aportes del panel de detalle. */
export interface AporteFicticio {
  fecha: string;
  valor: number;
  rend: number;
  saldo: number;
  est: EstadoAporte;
  cert: string;
  tras: string;
  rc: number;
  cumple: string;
}

/** Un aporte ficticio por año, con el estado que corresponde a su antigüedad. */
export function aportesDe(c: Contrato): AporteFicticio[] {
  return c.anios.map(([a, v]) => {
    const est: EstadoAporte = a <= 2016 ? 'ex' : c.cc > 0 ? 'cc' : 'sr';
    const val = Math.round(v * 0.78);
    return {
      fecha: '15/03/' + a, valor: val, rend: v - val, saldo: v, est, cert: 'Sí', tras: 'No',
      rc: est === 'cc' ? Math.round(v * 0.04) : 0, cumple: a <= 2016 ? 'Sí' : 'No',
    };
  });
}

/** «$x de exento, $y de sin retención y $z de con retención» (de qué tramos sale el retiro). */
export function tramosQueSalen(k: Calculo): string {
  const tr = (
    [
      [TEXTOS_DETALLE.tramoSale.ex, k.ex],
      [TEXTOS_DETALLE.tramoSale.sr, k.sr],
      [TEXTOS_DETALLE.tramoSale.cc, k.cc],
    ] as const
  )
    .filter((x) => x[1] > 0.5)
    .map((x) => pesos(x[1]) + ' de ' + x[0]);
  const ult = tr.pop();
  return (tr.length ? tr.join(', ') + ' y ' : '') + (ult ?? '');
}
