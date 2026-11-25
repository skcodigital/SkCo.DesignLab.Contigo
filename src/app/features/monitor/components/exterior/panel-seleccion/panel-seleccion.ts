import { ChangeDetectionStrategy, Component, computed, input, output, viewChildren } from '@angular/core';
import { Desplegable } from '@features/monitor/components/comunes/desplegable/desplegable';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { ListaMezclas } from '@features/monitor/components/detalle/lista-mezclas/lista-mezclas';
import { ListaReferencias } from '@features/monitor/components/detalle/lista-referencias/lista-referencias';
import { DivisasIndicadores } from '@features/monitor/components/exterior/divisas-indicadores/divisas-indicadores';
import { ListaPortafolios } from '@features/monitor/components/exterior/lista-portafolios/lista-portafolios';
import { COMPANIAS_REFERENCIA, MEZCLAS, PLAZOS_CDT } from '@features/monitor/data/detalle-catalogos.mock';
import { CATALOGO_EXTERIOR, PORTAFOLIOS_LISTA, SELECCION_VACIA } from '@features/monitor/data/exterior-catalogos.mock';
import { EtiquetaDesplegable } from '@features/monitor/interfaces/comunes';
import { SeleccionExterior } from '@features/monitor/interfaces/exterior';
import { haySeleccion } from '@features/monitor/utils/exterior-seleccion';

/**
 * «Selecciona y compara» (`canvas`): aviso «Antes de comparar…», restablecer, plegar el panel y las secciones
 * Portafolios SK, Mezclas Invest-ed, Competencia, Divisas e Indicadores (al abrir una se cierran las demás).
 *
 * En la página es un panel lateral de 300px que se pliega a 0; con `modal` ocupa la modal de pantalla completa
 * de móvil y suma abajo «Graficar selección» y «Salir». Avisa cada cambio de una lista con `cambio`.
 */
@Component({
  selector: 'nc-mon-panel-seleccion',
  imports: [Desplegable, DivisasIndicadores, Icono, ListaMezclas, ListaPortafolios, ListaReferencias, Tooltip],
  templateUrl: './panel-seleccion.html',
  styleUrl: './panel-seleccion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.en-modal]': 'modal()' },
})
export class PanelSeleccion {
  /** Dentro de la modal de móvil (siempre abierto y a todo el ancho). */
  readonly modal = input(false);
  /** Desplegado (en la página). */
  readonly abierto = input(true);
  readonly seleccion = input<SeleccionExterior>(SELECCION_VACIA);
  readonly conError = input(false);
  readonly hoy = input<Date>(new Date());

  readonly cambio = output<Partial<SeleccionExterior>>();
  /** Plegar o desplegar el panel. */
  readonly alternar = output<void>();
  readonly restablecer = output<void>();
  readonly graficar = output<void>();
  readonly salir = output<void>();

  protected readonly portafolios = PORTAFOLIOS_LISTA;
  protected readonly indicadores = CATALOGO_EXTERIOR.indicadores;
  protected readonly mezclas = MEZCLAS;
  protected readonly companias = COMPANIAS_REFERENCIA;
  protected readonly plazos = PLAZOS_CDT;
  protected readonly etiquetaBeta: EtiquetaDesplegable = { tipo: 'info', texto: 'Beta' };

  private readonly secciones = viewChildren(Desplegable);

  protected readonly desplegado = computed(() => this.modal() || this.abierto());
  protected readonly ancho = computed(() => {
    if (this.modal()) {
      return '100%';
    }
    return this.abierto() ? '300px' : '0px';
  });
  protected readonly conSeleccion = computed(() => haySeleccion(this.seleccion()));

  /** Al abrir una sección se cierran las demás. */
  protected cerrarOtras(abierta: Desplegable): void {
    this.secciones()
      .filter((s) => s !== abierta)
      .forEach((s) => s.cerrar());
  }

  protected restablecerSiHay(): void {
    if (this.conSeleccion()) {
      this.restablecer.emit();
    }
  }
}
