import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal, viewChild } from '@angular/core';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { GraficaLineasCompacta } from '@features/monitor/components/comunes/grafica-lineas-compacta/grafica-lineas-compacta';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { PersonalizarColumnas } from '@features/monitor/components/comunes/personalizar-columnas/personalizar-columnas';
import { Seleccion } from '@features/monitor/components/comunes/seleccion/seleccion';
import { SelectorFechas } from '@features/monitor/components/comunes/selector-fechas/selector-fechas';
import { SelectorPeriodoMovil } from '@features/monitor/components/comunes/selector-periodo-movil/selector-periodo-movil';
import { Tabla } from '@features/monitor/components/comunes/tabla/tabla';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { ComposicionClases } from '@features/monitor/components/detalle/composicion-clases/composicion-clases';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { RangoFechas, ValoresCasillas, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { TendenciaMezcla } from '@features/monitor/interfaces/detalle';
import { CASILLAS_TENDENCIA, COLUMNAS_TENDENCIA, opcionesTablaTendencia } from '@features/monitor/utils/detalle-tablas';
import { tendenciaEnRango } from '@features/monitor/utils/detalle-tendencia';
import { desdeIso } from '@features/monitor/utils/fechas';
import { formatearFechaCorta } from '@features/monitor/utils/formatos';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';
import { OPCIONES_PERIODO, PERIODO, rangoPorPeriodo, rangoVisible } from '@features/monitor/utils/periodos';

/** Periodo con el que se armó la tendencia (lo que se «consultó»). */
interface PeriodoAplicado {
  nombre: string;
  rango: RangoFechas;
}

const VACIO: RangoFechas = { inicio: '', fin: '' };

/**
 * Pestaña «Tendencia» de una mezcla (`tendency`): composición, comportamiento de cada portafolio con su selector
 * de periodo y tabla con «Personaliza» y copiar. Al elegir un periodo se vuelve a armar todo para ese rango (en
 * producción se volvía a consultar); con «Personalizado» espera a que se elija el rango.
 */
@Component({
  selector: 'nc-mon-tendencia',
  imports: [
    ComposicionClases,
    ErrorServicio,
    GraficaLineasCompacta,
    Icono,
    PersonalizarColumnas,
    Seleccion,
    SelectorFechas,
    SelectorPeriodoMovil,
    Tabla,
    Tooltip,
  ],
  templateUrl: './tendencia.html',
  styleUrl: './tendencia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tendencia {
  readonly tendencia = input.required<TendenciaMezcla>();
  /** Periodo inicial: «Último mes» en el cliente; el de la comparación en el exterior. */
  readonly periodoInicial = input<number>(PERIODO.ultimoMes);
  /** Rango del periodo inicial cuando es «Personalizado». */
  readonly rangoInicial = input<RangoFechas>(VACIO);
  readonly hoy = input<Date>(new Date());
  readonly vista = input<VistaMonitor>('cliente');
  readonly esMovil = input(false);
  readonly conError = input(false);

  private readonly tabla = viewChild<Tabla>('tabla');

  protected readonly opcionesPeriodo = OPCIONES_PERIODO;
  protected readonly personalizado = PERIODO.personalizado;
  protected readonly casillas = CASILLAS_TENDENCIA;
  protected readonly textoCopiar = TEXTOS_DETALLE.tablas.copiarEnExcel;

  protected readonly seleccionado = linkedSignal<number>(() => this.periodoInicial());
  protected readonly rangoPersonalizado = signal<RangoFechas>(VACIO);
  protected readonly columnas = signal<ValoresCasillas | null>(COLUMNAS_TENDENCIA);

  private readonly aplicado = linkedSignal<PeriodoAplicado>(() => {
    const periodo = this.periodoInicial();
    return {
      nombre: this.nombrePeriodo(periodo),
      rango: periodo === PERIODO.personalizado ? this.rangoInicial() : rangoPorPeriodo(periodo, this.hoy()),
    };
  });

  protected readonly datos = computed(() =>
    tendenciaEnRango(this.tendencia(), this.aplicado().rango, this.hoy(), COLORES_GRAFICA[this.vista()]),
  );

  protected readonly opcionesTabla = computed(() =>
    opcionesTablaTendencia(this.datos().filas, this.columnas() ?? COLUMNAS_TENDENCIA, this.vista()),
  );

  protected readonly encabezadoPeriodo = computed(() => {
    const { nombre, rango } = this.aplicado();
    const fecha = (iso: string): string => {
      const d = desdeIso(iso);
      return d ? formatearFechaCorta(d) : '';
    };
    return { nombre, inicio: fecha(rango.inicio), fin: fecha(rango.fin) };
  });

  /** Rango que se muestra bajo la gráfica en móvil (según lo elegido en el selector). */
  protected readonly rangoMovil = computed(() =>
    rangoVisible(this.seleccionado(), this.rangoPersonalizado(), this.hoy()),
  );

  protected elegirPeriodo(valor: number | string): void {
    const periodo = Number(valor);
    this.seleccionado.set(periodo);
    this.rangoPersonalizado.set(VACIO);
    if (periodo !== PERIODO.personalizado) {
      this.aplicado.set({ nombre: this.nombrePeriodo(periodo), rango: rangoPorPeriodo(periodo, this.hoy()) });
    }
  }

  protected elegirRango(rango: RangoFechas): void {
    this.rangoPersonalizado.set(rango);
    if (rango.inicio && rango.fin) {
      this.aplicado.set({ nombre: this.nombrePeriodo(this.seleccionado()), rango });
    }
  }

  protected copiar(): void {
    this.tabla()?.copiarTabla();
  }

  private nombrePeriodo(valor: number): string {
    return OPCIONES_PERIODO.find((o) => Number(o.valor) === Number(valor))?.nombre ?? '';
  }
}
