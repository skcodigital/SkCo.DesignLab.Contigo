import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { LeyendaGrafica } from '@features/monitor/components/comunes/leyenda-grafica/leyenda-grafica';
import { TEXTOS } from '@features/monitor/constants/textos';
import {
  FormatoRegional,
  SerieLeyenda,
  SerieLineaCompacta,
  VistaMonitor,
} from '@features/monitor/interfaces/comunes';
import { EChartsType } from '@features/monitor/utils/echarts';
import {
  ICONO_GUARDAR_COMO_IMAGEN,
  opcionesLineas,
  seriesLineasCompactas,
} from '@features/monitor/utils/graficas-lineas';
import { aParametros, tooltipLineasCompacta } from '@features/monitor/utils/tooltips-lineas';

/**
 * Gráfica de líneas de las secciones de detalle (`shared/line-charts`: tendencia y evolución de un activo):
 * leyenda propia, líneas con zoom y un tooltip con el valor real de cada serie en pesos.
 */
@Component({
  selector: 'nc-mon-grafica-lineas-compacta',
  imports: [Grafica, LeyendaGrafica],
  templateUrl: './grafica-lineas-compacta.html',
  styleUrl: './grafica-lineas-compacta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficaLineasCompacta {
  readonly etiquetas = input<readonly string[]>([]);
  readonly series = input<readonly SerieLineaCompacta[]>([]);
  readonly yMin = input(0);
  readonly yMax = input(1000);
  /** Leyenda y formato de los números de cada vista (`es-CO` en el cliente, `en-US` en el exterior). */
  readonly vista = input<VistaMonitor>('cliente');

  private readonly avisos = inject(AvisoStore);
  private grafica: EChartsType | null = null;

  private readonly formato = computed<FormatoRegional>(() => (this.vista() === 'cliente' ? 'es-CO' : 'en-US'));

  protected readonly leyenda = computed<SerieLeyenda[]>(() =>
    this.series().map((s) => ({ nombre: s.nombre, color: s.color })),
  );

  protected readonly activas = linkedSignal<Readonly<Record<string, boolean>>>(() =>
    Object.fromEntries(this.series().map((s) => [s.nombre, true])),
  );

  private readonly formatear = (params: unknown): string =>
    tooltipLineasCompacta(aParametros(params), this.series(), this.formato());

  protected readonly opciones = computed(() =>
    opcionesLineas({
      etiquetas: this.etiquetas(),
      series: seriesLineasCompactas(this.series()),
      yMin: this.yMin(),
      yMax: this.yMax(),
      formatter: this.formatear,
      guardar: {
        clave: 'myGuardarImagen',
        titulo: TEXTOS.graficas.guardarComoImagen,
        icono: ICONO_GUARDAR_COMO_IMAGEN,
        alClic: () => this.avisos.mostrar(TEXTOS.sinDescargas),
      },
    }),
  );

  protected alIniciar(grafica: EChartsType): void {
    this.grafica = grafica;
  }

  protected alternar(nombre: string): void {
    const activa = !!this.activas()[nombre];
    this.grafica?.dispatchAction({ type: activa ? 'legendUnSelect' : 'legendSelect', name: nombre });
    this.activas.update((a) => ({ ...a, [nombre]: !activa }));
  }
}
