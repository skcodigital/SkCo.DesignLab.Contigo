import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { SelectorFechas } from '@features/monitor/components/comunes/selector-fechas/selector-fechas';
import {
  OpcionSeleccion,
  PildoraPeriodo,
  RangoFechas,
  VistaMonitor,
} from '@features/monitor/interfaces/comunes';
import { OPCIONES_PERIODO, PERIODO, PILDORAS_PERIODO } from '@features/monitor/utils/periodos';

/**
 * Selector de periodo en móvil (`mobile-period-selector`): tres píldoras rápidas, un botón de calendario que
 * despliega todos los periodos y, con «Personalizado», el selector de fechas debajo.
 */
@Component({
  selector: 'nc-mon-selector-periodo-movil',
  imports: [Icono, SelectorFechas],
  templateUrl: './selector-periodo-movil.html',
  styleUrl: './selector-periodo-movil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorPeriodoMovil {
  readonly pildoras = input<readonly PildoraPeriodo[]>(PILDORAS_PERIODO);
  readonly opciones = input<readonly OpcionSeleccion[]>(OPCIONES_PERIODO);
  readonly seleccionado = input<number | string>(PILDORAS_PERIODO[0].valor);
  readonly rango = input<RangoFechas>({ inicio: '', fin: '' });
  /** «Hoy» del selector de fechas. */
  readonly hoy = input<Date>(new Date());
  readonly vista = input<VistaMonitor>('cliente');

  readonly seleccion = output<number>();
  readonly rangoCambio = output<RangoFechas>();

  protected readonly personalizado = PERIODO.personalizado;
  protected readonly mostrarOpciones = signal(false);

  protected esActivo(valor: number | string): boolean {
    return String(this.seleccionado()) === String(valor);
  }

  protected elegir(valor: number | string): void {
    this.mostrarOpciones.set(false);
    this.seleccion.emit(Number(valor));
  }
}
