import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { Variacion } from '@features/radiografia/components/comunes/variacion/variacion';
import { IconoSpView } from '@features/radiografia/components/sin-pac/icono-sp/icono-sp';
import {
  CLIENTES_EMPRESA_SP,
  EDADES_SP,
  EVOLUCION_SP,
  OPORTUNIDAD_SP,
  PRODUCTOS_POR_CLIENTE_SP,
  SEGMENTOS_SP,
} from '@features/radiografia/data/sin-pac.mock';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { pct } from '@features/radiografia/utils/formato';
import {
  altoBarra,
  arcosDona,
  conPorcentaje,
  netoPar,
  textoClientes,
  tipOportunidad,
  tipPar,
  tipProductos,
  tipSegmento,
} from '@features/radiografia/utils/sin-pac';

const TOTAL = CLIENTES_EMPRESA_SP;
const MAX_PAR = Math.max(...EVOLUCION_SP.flatMap((p) => [p.nuevos, p.perdidos]));
const MAX_EDAD = Math.max(...EDADES_SP.map((e) => e.n));
const ARCOS = arcosDona(SEGMENTOS_SP.map((s) => s.n), TOTAL);

/** Clientes sin plan corporativo: la oportunidad, evolución, productos por cliente, segmentos y edades. */
@Component({
  selector: 'nc-rx-clientes-sin-pac',
  imports: [ChartTip, Variacion, IconoSpView],
  templateUrl: './clientes-sin-pac.html',
  styleUrl: './clientes-sin-pac.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesSinPac {
  protected readonly store = inject(RadiografiaStore);
  protected readonly total = TOTAL;

  protected readonly oportunidad = OPORTUNIDAD_SP.map((t) => ({ ...t, tip: tipOportunidad(t) }));

  protected readonly evolucion = EVOLUCION_SP.map((p) => {
    const neto = netoPar(p);
    return {
      ...p,
      neto,
      aria: `${p.anio}: ${p.nuevos} nuevos, ${p.perdidos} perdidos, ${neto.texto.toLowerCase()}`,
      altoNuevos: altoBarra(p.nuevos, MAX_PAR, 170, 8),
      altoPerdidos: altoBarra(p.perdidos, MAX_PAR, 170, 8),
      tipNuevos: tipPar(p.anio, true, p.nuevos),
      tipPerdidos: tipPar(p.anio, false, p.perdidos),
    };
  });

  protected readonly productos = conPorcentaje(PRODUCTOS_POR_CLIENTE_SP, TOTAL).map((g) => ({
    ...g,
    tip: tipProductos(g, g.pct),
  }));

  protected readonly segmentos = conPorcentaje(SEGMENTOS_SP, TOTAL).map((s, i) => ({
    ...s,
    arco: ARCOS[i],
    tip: tipSegmento(s, s.pct),
  }));
  protected readonly ariaDona =
    'Clientes por segmento: ' + this.segmentos.map((s) => `${s.nombre} ${s.n} (${s.pct}%)`).join(', ') + '.';

  protected readonly edades = EDADES_SP.map((e) => ({
    ...e,
    alto: altoBarra(e.n, MAX_EDAD, 180),
    aria: `${e.etiqueta}: ${textoClientes(e.n)}`,
    tip: { titulo: e.rango, lineas: [`${textoClientes(e.n)} · ${pct(e.n, TOTAL)}%`] },
  }));
}
