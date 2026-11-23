import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject, signal } from '@angular/core';
import { TEXTOS } from '../../constants/textos';
import { ASESORES, COMISIONES_POR_MES, DISTRIBUCION_CLIENTES, TOTAL_COMISIONES } from '../../data/logros.mock';
import { DashboardStore } from '../../state/dashboard.store';
import { IconoOjo } from '../icono-ojo/icono-ojo';
import { DonaDistribucion } from './dona-distribucion/dona-distribucion';
import { GraficaComisiones } from './grafica-comisiones/grafica-comisiones';
import { Indicador } from './indicador/indicador';
import { SelectorAsesor } from './selector-asesor/selector-asesor';
import { SelectorMes } from './selector-mes/selector-mes';

/** Elementos con tooltip por foco: en táctil, tocar fuera de ellos cierra su tooltip. */
const CON_TOOLTIP = '.ds-pt,.ds-dona,.ds-tt-btn';

/**
 * Logros del mes: selector de mes, selector de asesor (vista del director), ojo de saldos (arranca oculto),
 * indicadores, distribución de clientes y comisiones.
 */
@Component({
  selector: 'section[nc-logros]',
  imports: [SelectorMes, SelectorAsesor, IconoOjo, Indicador, DonaDistribucion, GraficaComisiones],
  templateUrl: './logros.html',
  styleUrl: './logros.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ds-logros',
    'aria-label': 'Logros del mes',
    '[class.oculto]': 'oculto()',
    '(document:click)': 'cerrarTooltipTactil($event)',
  },
})
export class Logros {
  protected readonly store = inject(DashboardStore);
  private readonly document = inject(DOCUMENT);

  protected readonly asesores = ASESORES;
  protected readonly distribucion = DISTRIBUCION_CLIENTES;
  protected readonly comisiones = COMISIONES_POR_MES;
  protected readonly totalComisiones = TOTAL_COMISIONES;

  /** Los saldos siempre arrancan ocultos (también al volver al inicio: la vista se crea de nuevo). */
  protected readonly oculto = signal(true);
  protected readonly ojo = computed(() => {
    const o = TEXTOS.ojo;
    return this.oculto()
      ? { aria: o.ariaLogros.mostrar, tooltip: o.mostrar }
      : { aria: o.ariaLogros.ocultar, tooltip: o.ocultar };
  });

  protected readonly filaSuperior = computed(() => this.store.indicadores().slice(0, 3));
  protected readonly aum = computed(() => this.store.indicadores()[3]);

  protected cerrarTooltipTactil(e: MouseEvent): void {
    if (e.target instanceof Element && e.target.closest(CON_TOOLTIP)) return;
    const activo = this.document.activeElement;
    if (activo instanceof HTMLElement && activo.matches(CON_TOOLTIP)) activo.blur();
  }
}
