import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Tabla } from '@features/monitor/components/comunes/tabla/tabla';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { EventoFila, OpcionesTabla } from '@features/monitor/interfaces/comunes';

/**
 * Tabla de lo agregado con «Comparar» en una tarjeta gris: «Mezcla Invest-ed, Competencia, CDTs e Indicadores»
 * (con el aviso de la comparación contra CDT y la nota de la tasa promedio de los CDT) o «Indicadores para
 * comparar» (portafolios Skandia en la pestaña Portafolios). En Portafolios lleva la descripción debajo del título.
 */
@Component({
  selector: 'nc-mon-seccion-comparados',
  imports: [Icono, Tabla, Tooltip],
  templateUrl: './seccion-comparados.html',
  styleUrl: './seccion-comparados.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionComparados {
  readonly titulo = input.required<string>();
  readonly opciones = input.required<OpcionesTabla>();
  readonly conDescripcion = input(false);
  /** Hay un CDT aplicado: aviso de que lo demás se compara en rentabilidad móvil. */
  readonly avisoNormalizacion = input(false);
  /** Hay CDT en la tabla: nota de la tasa promedio ponderada. */
  readonly notaCdt = input(false);

  readonly accionCelda = output<EventoFila>();
  readonly accionFila = output<EventoFila>();

  protected readonly textoNormalizacion = TEXTOS.normalizacionCdt.aviso;
  protected readonly copiarTooltip = TEXTOS_CLIENTE.copiarTablaTooltip;
  private readonly tabla = viewChild(Tabla);

  protected copiar(): void {
    this.tabla()?.copiarTabla();
  }
}
