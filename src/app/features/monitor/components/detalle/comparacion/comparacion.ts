import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, model, output, signal } from '@angular/core';
import { injectMediaQuery } from '@core/utils/media-query';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { GraficaSinDatos } from '@features/monitor/components/comunes/grafica-sin-datos/grafica-sin-datos';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Seleccion } from '@features/monitor/components/comunes/seleccion/seleccion';
import { SelectorFechas } from '@features/monitor/components/comunes/selector-fechas/selector-fechas';
import { SelectorPeriodoMovil } from '@features/monitor/components/comunes/selector-periodo-movil/selector-periodo-movil';
import { Detalle } from '@features/monitor/components/detalle/detalle/detalle';
import { GraficaRiesgoRetorno } from '@features/monitor/components/detalle/grafica-riesgo-retorno/grafica-riesgo-retorno';
import { GraficaTendencia } from '@features/monitor/components/detalle/grafica-tendencia/grafica-tendencia';
import { TablaComparacion } from '@features/monitor/components/detalle/tabla-comparacion/tabla-comparacion';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { RangoFechas } from '@features/monitor/interfaces/comunes';
import { ActivoComparado, ActivoDetalle, PestanaComparacion } from '@features/monitor/interfaces/detalle';
import {
  activosSinDatos,
  datosRiesgoRetorno,
  filasComparacion,
  tieneDetalle,
} from '@features/monitor/utils/detalle-comparacion';
import { armarTendencia, tendenciaDecorativa } from '@features/monitor/utils/detalle-graficas';
import { OPCIONES_PERIODO, PERIODO, rangoVisible } from '@features/monitor/utils/periodos';

/**
 * Comparación del Monitor exterior (`monitor`): pestañas «Tendencia» y «Riesgo/Retorno» con el periodo, aviso de
 * activos sin datos, gráficas, tabla (o listado en móvil) y el detalle de un activo en una modal.
 *
 * La página arma `activos` para el periodo (`[(periodo)]`, `[(rango)]`): cambiar el periodo no consulta nada, solo
 * actualiza los modelos. Avisa `quitar` (retirar un activo desde la leyenda o la tabla) y `abrirComparar` (botones
 * «Compara» y «Selecciona ahora» en móvil). Sin activos muestra «¡Selecciona la información que quieras graficar!».
 */
@Component({
  selector: 'nc-mon-comparacion',
  imports: [
    Detalle,
    ErrorServicio,
    GraficaRiesgoRetorno,
    GraficaSinDatos,
    GraficaTendencia,
    Icono,
    Seleccion,
    SelectorFechas,
    SelectorPeriodoMovil,
    TablaComparacion,
  ],
  templateUrl: './comparacion.html',
  styleUrl: './comparacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Comparacion {
  readonly activos = input<readonly ActivoComparado[]>([]);
  /** Periodo elegido (por defecto «Año en curso (YTD)», como producción). */
  readonly periodo = model<number>(PERIODO.anioEnCurso);
  /** Rango de «Personalizado». */
  readonly rango = model<RangoFechas>({ inicio: '', fin: '' });
  readonly hoy = input<Date>(new Date());
  /** Error al cargar portafolios, indicadores y mezclas a la vez. */
  readonly conError = input(false);

  readonly quitar = output<string>();
  readonly abrirComparar = output<void>();

  protected readonly esMovil = injectMediaQuery('(max-width: 767.98px)');
  protected readonly opcionesPeriodo = OPCIONES_PERIODO;
  protected readonly personalizado = PERIODO.personalizado;
  protected readonly textoSinDatosGrafica = TEXTOS_DETALLE.comparacion.sinDatosGrafica;

  protected readonly pestana = signal<PestanaComparacion>('tendencia');
  /** Series ocultas desde la leyenda: vuelven a verse todas cuando cambian los datos. */
  protected readonly ocultas = linkedSignal<readonly ActivoComparado[], string[]>({
    source: this.activos,
    computation: () => [],
  });
  protected readonly detalle = signal<ActivoDetalle | null>(null);

  protected readonly sinSeleccion = computed(() => !this.activos().length);
  protected readonly conCdt = computed(() => this.activos().some((a) => a.tipo === 'cdt'));
  private readonly tendenciaReal = computed(() => armarTendencia(this.activos()));
  protected readonly sinDatosGrafica = computed(() => !this.sinSeleccion() && !this.tendenciaReal());
  protected readonly tendencia = computed(() => this.tendenciaReal() ?? tendenciaDecorativa(this.hoy()));
  protected readonly mensajeSinDatos = computed(() => (this.tendenciaReal() ? activosSinDatos(this.activos()) : ''));
  protected readonly filas = computed(() => filasComparacion(this.activos(), this.ocultas()));
  protected readonly riesgoRetorno = computed(() => datosRiesgoRetorno(this.activos()));

  protected readonly nombrePeriodo = computed(
    () => OPCIONES_PERIODO.find((o) => Number(o.valor) === Number(this.periodo()))?.nombre ?? '',
  );
  protected readonly rangoMovil = computed(() => rangoVisible(this.periodo(), this.rango(), this.hoy()));

  protected elegirPeriodo(valor: number | string): void {
    this.rango.set({ inicio: '', fin: '' });
    this.periodo.set(Number(valor));
  }

  /** Oculta o muestra una serie (leyenda de cualquiera de las dos gráficas): la tabla la saca o la vuelve a poner. */
  protected alternarSerie(clave: string): void {
    this.ocultas.update((o) => (o.includes(clave) ? o.filter((c) => c !== clave) : [...o, clave]));
  }

  protected verDetalle(clave: string): void {
    const activo = this.activos().find((a) => a.clave === clave);
    if (activo?.detalle && tieneDetalle(activo)) {
      this.detalle.set(activo.detalle);
    }
  }
}
