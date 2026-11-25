import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormatoRegional } from '@features/monitor/interfaces/comunes';
import { compararDias, DiaCalendario, mismoDia, NOMBRES_CALENDARIO, semanasDelMes } from '@features/monitor/utils/fechas';

/**
 * Un mes del selector de fechas (`ngb-datepicker-month` con la plantilla de día de producción): días de la
 * semana, 6 semanas desde el lunes, días de otros meses vacíos y días posteriores a `maximo` deshabilitados.
 */
@Component({
  selector: 'nc-mon-calendario-mes',
  templateUrl: './calendario-mes.html',
  styleUrl: './calendario-mes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.primero]': 'primero()', '[class.ultimo]': 'ultimo()' },
})
export class CalendarioMes {
  readonly anio = input.required<number>();
  /** Mes 0–11. */
  readonly mes = input.required<number>();
  readonly formato = input<FormatoRegional>('es-CO');
  readonly maximo = input.required<Date>();
  readonly desde = input<Date | null>(null);
  readonly hasta = input<Date | null>(null);
  readonly sobre = input<Date | null>(null);
  /** Posición del mes en el calendario (cambia los márgenes de las semanas, como ng-bootstrap). */
  readonly primero = input(true);
  readonly ultimo = input(true);

  readonly elegir = output<Date>();
  readonly sobreCambio = output<Date | null>();

  protected readonly dias = computed(() => NOMBRES_CALENDARIO[this.formato()].diasCortos);
  protected readonly semanas = computed(() => semanasDelMes(this.anio(), this.mes()));

  protected deshabilitado(d: DiaCalendario): boolean {
    return compararDias(d.fecha, this.maximo()) > 0;
  }

  /** Entre el inicio y el día bajo el puntero, mientras falta el fin. */
  protected enHover(fecha: Date): boolean {
    const desde = this.desde();
    const sobre = this.sobre();
    return !!desde && !this.hasta() && !!sobre && compararDias(fecha, desde) > 0 && compararDias(fecha, sobre) < 0;
  }

  /** Estrictamente entre el inicio y el fin elegidos. */
  protected adentro(fecha: Date): boolean {
    const desde = this.desde();
    const hasta = this.hasta();
    return !!desde && !!hasta && compararDias(fecha, desde) > 0 && compararDias(fecha, hasta) < 0;
  }

  protected extremo(fecha: Date): boolean {
    const desde = this.desde();
    const hasta = this.hasta();
    return (!!desde && mismoDia(fecha, desde)) || (!!hasta && mismoDia(fecha, hasta));
  }
}
