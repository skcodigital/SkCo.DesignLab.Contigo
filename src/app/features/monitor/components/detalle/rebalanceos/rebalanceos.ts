import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Desplegable } from '@features/monitor/components/comunes/desplegable/desplegable';
import { GraficaTortaCompacta } from '@features/monitor/components/comunes/grafica-torta-compacta/grafica-torta-compacta';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { PorcionTortaCompacta, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { Rebalanceo } from '@features/monitor/interfaces/detalle';
import { COLORES_GRAFICA, colorSerie } from '@features/monitor/utils/graficas';

/** Composición antes y después de un rebalanceo, con el color de la paleta por posición. */
interface RebalanceoVista {
  fecha: string;
  antes: PorcionTortaCompacta[];
  despues: PorcionTortaCompacta[];
}

/**
 * Pestaña «Rebalanceos» de una mezcla (`rebalances`, deshabilitada en producción): un desplegable por
 * rebalanceo con la torta de «Estaba en:» y «Cambió a:». El «Select Date» de la cabecera es un texto fijo, como
 * en producción.
 */
@Component({
  selector: 'nc-mon-rebalanceos',
  imports: [Desplegable, GraficaTortaCompacta, Icono],
  templateUrl: './rebalanceos.html',
  styleUrl: './rebalanceos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rebalanceos {
  readonly rebalanceos = input<readonly Rebalanceo[]>([]);
  readonly vista = input<VistaMonitor>('cliente');

  protected readonly vistas = computed<RebalanceoVista[]>(() => {
    const paleta = COLORES_GRAFICA[this.vista()];
    const porciones = (clases: Rebalanceo['antes']): PorcionTortaCompacta[] =>
      clases.map((c, i) => ({ nombre: c.nombre, valor: c.porcentaje, color: colorSerie(i, paleta) }));
    return this.rebalanceos().map((r) => ({ fecha: r.fecha, antes: porciones(r.antes), despues: porciones(r.despues) }));
  });

  protected porcentaje(valor: number): string {
    return `${valor.toFixed(2)}%`;
  }
}
