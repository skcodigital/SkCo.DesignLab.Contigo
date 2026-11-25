import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  untracked,
} from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { injectMediaQuery } from '@core/utils/media-query';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { LeyendaGrafica } from '@features/monitor/components/comunes/leyenda-grafica/leyenda-grafica';
import { TEXTOS } from '@features/monitor/constants/textos';
import { DetallePunto, PuntoLinea, SerieLinea } from '@features/monitor/interfaces/comunes';
import { EChartsType } from '@features/monitor/utils/echarts';
import { rangoYVisible } from '@features/monitor/utils/graficas';
import {
  ICONO_GUARDAR_IMAGEN,
  leyendaOculta,
  opcionesLineas,
  opcionesSinDatos,
  seriesLineas,
  sinDatosLineas,
} from '@features/monitor/utils/graficas-lineas';
import {
  aParametros,
  contenidoFaseTooltip,
  FaseTooltip,
  ParametroTooltip,
  tooltipLineas,
} from '@features/monitor/utils/tooltips-lineas';

/** Detalle de saldos y rendimientos de un punto: un registro por serie de la lista (en el mismo orden). */
export type CargarDetallePunto = (indice: number, puntos: readonly PuntoLinea[]) => readonly DetallePunto[];

/** Espera antes de mostrar la cuenta regresiva y simulación de la consulta del detalle (no hay servicio). */
const ESPERA_MS = 1000;
const SEGUNDOS_CUENTA = 5;
const DEMORA_CARGA_MS = 800;

/**
 * Gráfica principal del Monitor del cliente (`ui/shared/line-chart`): título, leyenda propia y líneas con zoom.
 * Al cambiar las series vuelven a verse todas; el eje Y se ajusta a lo visible en la ventana del zoom.
 *
 * Con `detallePunto`, al detenerse sobre un día de un contrato el tooltip cuenta 5 segundos, muestra la carga y
 * luego los saldos y rendimientos de ese día (en producción venían de un servicio).
 */
@Component({
  selector: 'nc-mon-grafica-lineas',
  imports: [Grafica, LeyendaGrafica],
  templateUrl: './grafica-lineas.html',
  styleUrl: './grafica-lineas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficaLineas {
  readonly etiquetas = input<readonly string[]>([]);
  readonly series = input<readonly SerieLinea[]>([]);
  readonly yMin = input(0);
  readonly yMax = input(0);
  /** Gráfica de portafolios (sin rendimiento ni saldo en el tooltip) o de contratos. */
  readonly esPortafolio = input(false);
  readonly detallePunto = input<CargarDetallePunto | null>(null);
  /** Nombres de las series que son contratos del cliente (las únicas que piden el detalle). */
  readonly seriesContrato = input<readonly string[]>([]);

  /** Nombre de la serie que la persona retiró de la leyenda (solo las agregadas con «Comparar»). */
  readonly quitarSerie = output<string>();
  /** Series ocultas desde la leyenda: la tabla también las oculta. */
  readonly seriesOcultas = output<string[]>();

  private readonly avisos = inject(AvisoStore);
  private readonly esMovil = injectMediaQuery('(max-width: 768px)');
  private grafica: EChartsType | null = null;

  protected readonly titulo = computed(() =>
    this.esPortafolio() ? TEXTOS.graficas.tituloPortafolios : TEXTOS.graficas.tituloContratos,
  );

  /** Visibilidad por serie; vuelve a «todas» cada vez que llegan series nuevas. */
  protected readonly activas = linkedSignal<Readonly<Record<string, boolean>>>(() =>
    Object.fromEntries(this.series().map((s) => [s.nombre, true])),
  );
  private readonly ocultas = computed(() => Object.keys(this.activas()).filter((k) => !this.activas()[k]));

  private readonly formatear = (params: unknown): string => this.tooltip(aParametros(params));

  protected readonly opciones = computed(() => {
    const series = this.series();
    if (sinDatosLineas(series)) {
      return opcionesSinDatos();
    }
    const etiquetas = this.etiquetas();
    // Producción ajusta el eje Y a lo visible justo después de pintar (el zoom arranca en 0–100 %).
    const rango = rangoYVisible(series, etiquetas.length, 0, 100);
    return opcionesLineas({
      etiquetas,
      series: seriesLineas(series),
      yMin: rango?.min ?? this.yMin(),
      yMax: rango?.max ?? this.yMax(),
      formatter: this.formatear,
      leyenda: leyendaOculta(untracked(() => this.esMovil())),
      confinarTooltip: true,
      guardar: {
        clave: 'mySaveImage',
        titulo: TEXTOS.graficas.guardarImagen,
        icono: ICONO_GUARDAR_IMAGEN,
        alClic: () => this.avisos.mostrar(TEXTOS.sinDescargas),
      },
    });
  });

  // ── Detalle del punto (cuenta regresiva → carga → saldos y rendimientos) ──
  private fase: FaseTooltip | null = null;
  private indiceHover: number | null = null;
  private paramsHover: ParametroTooltip[] | null = null;
  private espera?: ReturnType<typeof setTimeout>;
  private cuenta?: ReturnType<typeof setInterval>;
  private ultimoPunto: [number, number] | null = null;

  constructor() {
    effect(() => this.seriesOcultas.emit(this.ocultas()));
    effect(() => {
      this.opciones();
      this.limpiarDetalle();
    });
    inject(DestroyRef).onDestroy(() => this.limpiarDetalle());
  }

  protected alIniciar(grafica: EChartsType): void {
    this.grafica = grafica;
    grafica.on('datazoom', () => this.ajustarEjeY());
    grafica.on('restore', () => {
      Object.entries(this.activas()).forEach(([name, activa]) =>
        grafica.dispatchAction({ type: activa ? 'legendSelect' : 'legendUnSelect', name }),
      );
      this.ajustarEjeY();
    });
    grafica.on('legendselectchanged', (e) => {
      const seleccion = (e as { selected?: Record<string, boolean> }).selected;
      if (seleccion) {
        this.activas.set({ ...seleccion });
        this.ajustarEjeY();
      }
    });
    grafica.on('globalout', () => {
      this.limpiarDetalle();
      this.indiceHover = null;
      this.paramsHover = null;
    });
    grafica.getZr().on('mousemove', (e) => {
      this.ultimoPunto = [e.offsetX, e.offsetY];
    });
  }

  /** Oculta o muestra una serie desde la leyenda. */
  protected alternar(nombre: string): void {
    const activa = !!this.activas()[nombre];
    this.grafica?.dispatchAction({ type: activa ? 'legendUnSelect' : 'legendSelect', name: nombre });
    this.activas.update((a) => ({ ...a, [nombre]: !activa }));
    this.ajustarEjeY();
  }

  /** Eje Y según lo visible en la ventana del zoom (`actualizarRangoYSegunZoom`). */
  private ajustarEjeY(): void {
    const grafica = this.grafica;
    const zoom = (grafica?.getOption()['dataZoom'] as { start?: number; end?: number }[] | undefined)?.[0];
    if (!grafica || !zoom) {
      return;
    }
    const visibles = this.series().filter((s) => this.activas()[s.nombre]);
    const rango = rangoYVisible(visibles, this.etiquetas().length, zoom.start ?? 0, zoom.end ?? 100);
    if (rango) {
      grafica.setOption({ yAxis: { min: rango.min, max: rango.max } });
    }
  }

  private tooltip(params: ParametroTooltip[]): string {
    const conDetalle = !this.esPortafolio() && !!this.detallePunto();
    if (conDetalle) {
      this.alPasarPorPunto(params);
    }
    return tooltipLineas(params, {
      esPortafolio: this.esPortafolio(),
      conDetalle,
      esMovil: this.esMovil(),
      contenidoFase: contenidoFaseTooltip(this.fase, this.paramsHover ?? params),
    });
  }

  /** Arranca la espera y la cuenta regresiva al llegar a otro día con algún contrato visible. */
  private alPasarPorPunto(params: ParametroTooltip[]): void {
    const indice = params[0]?.dataIndex ?? -1;
    if (indice === this.indiceHover) {
      return;
    }
    const contratos = this.seriesContrato().filter(Boolean);
    if (!contratos.some((n) => this.activas()[n] !== false)) {
      return;
    }
    this.limpiarDetalle();
    this.indiceHover = indice;
    this.paramsHover = params;
    this.espera = setTimeout(() => {
      let segundos = SEGUNDOS_CUENTA;
      this.cambiarFase({ fase: 'cuenta', segundos });
      this.cuenta = setInterval(() => {
        segundos--;
        if (segundos >= 0) {
          this.cambiarFase({ fase: 'cuenta', segundos });
          return;
        }
        clearInterval(this.cuenta);
        this.cambiarFase({ fase: 'cargando' });
        this.espera = setTimeout(() => this.cargarDetalle(indice), DEMORA_CARGA_MS);
      }, 1000);
    }, ESPERA_MS);
  }

  private cargarDetalle(indice: number): void {
    const cargar = this.detallePunto();
    const puntos = (this.paramsHover ?? []).map((p) => p.data as PuntoLinea);
    this.cambiarFase({ fase: 'cargado', registros: cargar ? cargar(indice, puntos) : [] });
  }

  /** Cambia la fase y vuelve a pintar el tooltip donde está el puntero. */
  private cambiarFase(fase: FaseTooltip): void {
    this.fase = fase;
    const grafica = this.grafica;
    if (!grafica || !this.ultimoPunto) {
      return;
    }
    const [x, y] = this.ultimoPunto;
    // Ocultar y volver a mostrar obliga a ECharts a llamar otra vez al formatter en el mismo punto.
    grafica.dispatchAction({ type: 'hideTip' });
    grafica.dispatchAction({ type: 'showTip', x, y });
  }

  private limpiarDetalle(): void {
    clearTimeout(this.espera);
    clearInterval(this.cuenta);
    this.fase = null;
  }
}
