import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { GraficaLineasCompacta } from '@features/monitor/components/comunes/grafica-lineas-compacta/grafica-lineas-compacta';
import { Seleccion } from '@features/monitor/components/comunes/seleccion/seleccion';
import { SelectorFechas } from '@features/monitor/components/comunes/selector-fechas/selector-fechas';
import { ComposicionClases } from '@features/monitor/components/detalle/composicion-clases/composicion-clases';
import { RangoFechas, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { TendenciaActivo as DatosTendenciaActivo } from '@features/monitor/interfaces/detalle';
import { vistaTendenciaActivo } from '@features/monitor/utils/detalle-tendencia';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';
import { OPCIONES_PERIODO, PERIODO } from '@features/monitor/utils/periodos';

/**
 * Pestaña «Tendencia» de un activo que no es mezcla (`asset-trend`, deshabilitada en producción): clase de
 * activos y tendencia con selector de periodo. Como en producción (sin servicio), cambiar el periodo vuelve a
 * mostrar los mismos datos.
 */
@Component({
  selector: 'nc-mon-tendencia-activo',
  imports: [ComposicionClases, GraficaLineasCompacta, Seleccion, SelectorFechas],
  templateUrl: './tendencia-activo.html',
  styleUrl: './tendencia-activo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TendenciaActivo {
  readonly tendencia = input<DatosTendenciaActivo>({ categorias: [], etiquetas: [], series: [] });
  readonly hoy = input<Date>(new Date());
  readonly vista = input<VistaMonitor>('cliente');

  protected readonly opcionesPeriodo = OPCIONES_PERIODO;
  protected readonly personalizado = PERIODO.personalizado;
  protected readonly seleccionado = signal<number>(PERIODO.ultimoMes);
  protected readonly rango = signal<RangoFechas>({ inicio: '', fin: '' });

  protected readonly datos = computed(() => vistaTendenciaActivo(this.tendencia(), COLORES_GRAFICA[this.vista()]));
}
