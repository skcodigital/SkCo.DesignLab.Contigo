import { ChangeDetectionStrategy, Component, computed, input, viewChild } from '@angular/core';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { SinDatos } from '@features/monitor/components/comunes/sin-datos/sin-datos';
import { Tabla } from '@features/monitor/components/comunes/tabla/tabla';
import { TarjetasRendimiento } from '@features/monitor/components/comunes/tarjetas-rendimiento/tarjetas-rendimiento';
import { PeriodoRendimiento, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { PeriodoDesempeno } from '@features/monitor/interfaces/detalle';
import { opcionesTablaDesempeno } from '@features/monitor/utils/detalle-tablas';

/**
 * Pestaña «Desempeño» del detalle (`performance` para mezclas y `asset-performance` para el resto): tabla de
 * desempeño por periodos con botón de copiar o, en móvil, las tarjetas de rendimiento. `periodos = null` pinta el
 * error del servicio.
 */
@Component({
  selector: 'nc-mon-desempeno',
  imports: [ErrorServicio, Icono, SinDatos, Tabla, TarjetasRendimiento],
  templateUrl: './desempeno.html',
  styleUrl: './desempeno.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Desempeno {
  readonly periodos = input<readonly PeriodoDesempeno[] | null>([]);
  /** Mezcla Invest-ed: «Desempeño de la **mezcla**…» y el botón de copiar aun sin filas. */
  readonly esMezcla = input(false);
  /** «Desempeño del {etiqueta} en diferentes periodos.» */
  readonly etiquetaActivo = input('activo');
  /** Columna TIR (solo el cliente, y no cuando el activo se está comparando). */
  readonly conTir = input(false);
  readonly esMovil = input(false);
  readonly vista = input<VistaMonitor>('cliente');

  private readonly tabla = viewChild<Tabla>('tabla');

  protected readonly conError = computed(() => this.periodos() === null);
  protected readonly filas = computed(() => this.periodos() ?? []);

  protected readonly mostrarCopiar = computed(() => !this.conError() && (this.esMezcla() || this.filas().length > 0));

  protected readonly opciones = computed(() => opcionesTablaDesempeno(this.filas(), this.conTir(), this.vista()));

  protected readonly tarjetas = computed<PeriodoRendimiento[]>(() =>
    this.filas().map((p) => ({
      periodo: p.periodo,
      variacion: p.variacion,
      volatilidad: p.volatilidad,
      tea: p.tea,
      retorno: p.retorno,
    })),
  );

  protected copiar(): void {
    this.tabla()?.copiarTabla();
  }
}
