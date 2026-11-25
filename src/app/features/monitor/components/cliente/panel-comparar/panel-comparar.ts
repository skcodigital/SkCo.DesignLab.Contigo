import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CompararFondos } from '@features/monitor/components/cliente/comparar-fondos/comparar-fondos';
import { Desplegable } from '@features/monitor/components/comunes/desplegable/desplegable';
import { GrupoBotones } from '@features/monitor/components/comunes/grupo-botones/grupo-botones';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { ListaCdt } from '@features/monitor/components/detalle/lista-cdt/lista-cdt';
import { ListaMezclas } from '@features/monitor/components/detalle/lista-mezclas/lista-mezclas';
import { ListaReferencias } from '@features/monitor/components/detalle/lista-referencias/lista-referencias';
import { FONDOS_COMPARABLES } from '@features/monitor/data/cliente-comparar.mock';
import { COMPANIAS_REFERENCIA, INDICADORES, MEZCLAS, PLAZOS_CDT } from '@features/monitor/data/detalle-catalogos.mock';
import { SeleccionComparar } from '@features/monitor/interfaces/cliente';
import { EtiquetaDesplegable, OpcionBoton } from '@features/monitor/interfaces/comunes';
import { nombreIndicador } from '@features/monitor/utils/graficas';

const botones = (tipo: 'divisa' | 'indicador'): OpcionBoton[] =>
  INDICADORES.filter((i) => i.tipo === tipo).map((i) => ({ id: i.clave, etiqueta: nombreIndicador(i.clave, i.nombre) }));

/**
 * Panel lateral «Comparar» (el `offcanvas` de `btn-comparar`): aviso «Antes de comparar...», secciones plegables
 * (Portafolios SK, Mezclas Invest-ed, Competencia, Divisas e Indicadores con Económicos y CDTs; abrir una cierra
 * las demás) y «Aplicar» / «Borrar» fijos abajo. Lo marcado es un borrador (`seleccion`) que solo se aplica con
 * «Aplicar». Se cierra con la «x», Escape o un clic en el fondo.
 */
@Component({
  selector: 'nc-mon-panel-comparar',
  imports: [CompararFondos, Desplegable, GrupoBotones, Icono, ListaCdt, ListaMezclas, ListaReferencias],
  templateUrl: './panel-comparar.html',
  styleUrl: './panel-comparar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'alEscape($event)' },
})
export class PanelComparar {
  readonly seleccion = input.required<SeleccionComparar>();
  readonly hoy = input<Date>(new Date());

  readonly seleccionCambio = output<SeleccionComparar>();
  readonly aplicar = output<void>();
  readonly borrar = output<void>();
  readonly cerrar = output<void>();

  protected readonly fondos = FONDOS_COMPARABLES;
  protected readonly mezclas = MEZCLAS;
  protected readonly companias = COMPANIAS_REFERENCIA;
  protected readonly plazos = PLAZOS_CDT;
  protected readonly divisas = botones('divisa');
  protected readonly indicadores = botones('indicador');
  protected readonly beta: EtiquetaDesplegable = { tipo: 'info', texto: 'Beta' };
  protected readonly pestana = signal<'economicos' | 'cdt'>('economicos');

  private readonly secciones = viewChildren(Desplegable);
  private readonly lienzo = viewChild.required<ElementRef<HTMLElement>>('lienzo');

  constructor() {
    // Como ng-bootstrap, el foco pasa al panel al abrirse.
    afterNextRender(() => this.lienzo().nativeElement.focus());
  }

  protected cambiar(cambio: Partial<SeleccionComparar>): void {
    this.seleccionCambio.emit({ ...this.seleccion(), ...cambio });
  }

  /** Abrir una sección cierra las demás (`onSectionOpened`). */
  protected abrirSeccion(indice: number): void {
    this.secciones().forEach((d, i) => {
      if (i !== indice) {
        d.cerrar();
      }
    });
  }

  /** Escape cierra el panel, salvo que venga de una modal abierta encima (la de los CDT). */
  protected alEscape(e: Event): void {
    const origen = e.target instanceof Element ? e.target : null;
    if (!origen?.closest('nc-mon-modal')) {
      this.cerrar.emit();
    }
  }
}
