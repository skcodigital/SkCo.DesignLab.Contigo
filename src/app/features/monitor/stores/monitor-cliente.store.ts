import { computed, Injectable, signal } from '@angular/core';
import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { INICIO_HISTORIA_OSCAR, PORTAFOLIOS_OSCAR, PRODUCTOS_CONTRATO_OSCAR } from '@features/monitor/data/cliente.mock';
import { HOY_MONITOR } from '@features/monitor/data/detalle-catalogos.mock';
import { CONTRATOS_OSCAR } from '@features/monitor/data/detalle-cliente.mock';
import {
  ColumnasPorVista,
  DetalleAbierto,
  EscenarioCliente,
  PeriodoPestana,
  SeleccionComparar,
  VistaCliente,
} from '@features/monitor/interfaces/cliente';
import { RangoFechas, ValoresCasillas } from '@features/monitor/interfaces/comunes';
import {
  activosCliente,
  definicionComparada,
  plazoAplicado,
  quitarDeSeleccion,
  SELECCION_VACIA,
} from '@features/monitor/utils/cliente-comparacion';
import {
  etiquetaPeriodoCliente,
  insigniaRango,
  PERIODO_INICIAL_CLIENTE,
  rangoPeriodoCliente,
} from '@features/monitor/utils/cliente-periodos';
import { clavePortafolio } from '@features/monitor/utils/cliente-portafolios';
import { detallePuntoContratos } from '@features/monitor/utils/detalle-contratos';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';

/** Escenario del laboratorio a partir de `?estado=` («error», «sin-datos»; cualquier otro valor: los datos de Óscar). */
export function escenarioDesdeUrl(estado: string | null | undefined): EscenarioCliente {
  return estado === 'error' || estado === 'sin-datos' ? estado : 'normal';
}

/** Periodo con el que abre cada pestaña («Año en curso (YTD)»). */
function periodoInicial(): PeriodoPestana {
  return {
    periodo: PERIODO_INICIAL_CLIENTE,
    rango: rangoPeriodoCliente(PERIODO_INICIAL_CLIENTE, HOY_MONITOR, INICIO_HISTORIA_OSCAR) as RangoFechas,
    personalizado: null,
  };
}

/**
 * Estado de la página del Monitor del cliente (cero I/O; se provee en la página): pestaña, periodo y rango de
 * cada pestaña, lo marcado en «Comparar» (borrador y aplicado), series ocultas desde la leyenda, filtro de
 * portafolios, columnas de las tablas y las modales abiertas. Los datos de cada pestaña los arma
 * `MonitorClienteDatos` a partir de este estado.
 *
 * Como en producción, cambiar de pestaña borra lo comparado y el filtro; cada pestaña conserva su periodo.
 */
@Injectable()
export class MonitorClienteStore {
  readonly hoy = HOY_MONITOR;
  readonly paleta = COLORES_GRAFICA.cliente;
  readonly productos = PRODUCTOS_CONTRATO_OSCAR;

  private readonly _vista = signal<VistaCliente>('contratos');
  private readonly _escenario = signal<EscenarioCliente>('normal');
  private readonly _periodos = signal<Readonly<Record<VistaCliente, PeriodoPestana>>>({
    contratos: periodoInicial(),
    portafolios: periodoInicial(),
  });
  private readonly _borrador = signal<SeleccionComparar>(SELECCION_VACIA);
  private readonly _aplicada = signal<SeleccionComparar>(SELECCION_VACIA);
  private readonly _ocultas = signal<readonly string[]>([]);
  private readonly _filtro = signal<readonly string[]>([]);
  private readonly _columnas = signal<ColumnasPorVista>({ contratos: null, portafolios: null });
  private readonly _detalle = signal<DetalleAbierto | null>(null);
  private readonly _transacciones = signal<string | null>(null);

  readonly vista = this._vista.asReadonly();
  readonly escenario = this._escenario.asReadonly();
  readonly periodos = this._periodos.asReadonly();
  readonly borrador = this._borrador.asReadonly();
  readonly aplicada = this._aplicada.asReadonly();
  readonly ocultas = this._ocultas.asReadonly();
  readonly filtro = this._filtro.asReadonly();
  readonly columnas = this._columnas.asReadonly();
  readonly detalle = this._detalle.asReadonly();
  readonly transacciones = this._transacciones.asReadonly();

  readonly esContratos = computed(() => this._vista() === 'contratos');
  readonly conError = computed(() => this._escenario() === 'error');
  readonly periodoActual = computed(() => this._periodos()[this._vista()]);
  readonly insignia = computed(() => insigniaRango(this.periodoActual().periodo, this.periodoActual().rango));
  readonly etiquetaPeriodo = computed(() => etiquetaPeriodoCliente(this.periodoActual().periodo));
  readonly titulo = computed(() => (this.esContratos() ? TEXTOS_CLIENTE.titulos.contratos : TEXTOS_CLIENTE.titulos.portafolios));

  /** Datos de Óscar (o ninguno, en el escenario «sin datos»). */
  readonly contratosCliente = computed(() => (this._escenario() === 'sin-datos' ? [] : CONTRATOS_OSCAR));
  readonly portafoliosCliente = computed(() => (this._escenario() === 'sin-datos' ? [] : PORTAFOLIOS_OSCAR));

  readonly plazo = computed(() => plazoAplicado(this._aplicada()));
  readonly modoTasa = computed(() => !!this.plazo());
  /** Lo comparado en el rango de la pestaña actual (los colores siguen a los contratos propios). */
  readonly activos = computed(() =>
    activosCliente(this._aplicada(), this.periodoActual().rango, this.hoy, this.paleta, this.contratosCliente().length),
  );

  /** Saldo y rendimiento de un día de un contrato (el detalle del tooltip de la gráfica de contratos). */
  readonly detallePunto = detallePuntoContratos(CONTRATOS_OSCAR, HOY_MONITOR);

  definirEscenario(escenario: EscenarioCliente): void {
    this._escenario.set(escenario);
  }

  /** «Contratos» ↔ «Portafolios»: borra lo comparado, el filtro y las series ocultas. */
  cambiarVista(): void {
    this._borrador.set(SELECCION_VACIA);
    this._aplicada.set(SELECCION_VACIA);
    this._filtro.set([]);
    this._ocultas.set([]);
    this._vista.update((v) => (v === 'contratos' ? 'portafolios' : 'contratos'));
  }

  /** Elige el periodo de la pestaña actual. «Personalizado» espera las fechas (se sigue viendo el rango anterior). */
  elegirPeriodo(periodo: number): void {
    const rango = rangoPeriodoCliente(periodo, this.hoy, INICIO_HISTORIA_OSCAR);
    this.actualizarPeriodo((p) => ({ periodo, rango: rango ?? p.rango, personalizado: null }));
  }

  /** Rango elegido en el selector de fechas («Personalizado»). */
  elegirRango(rango: RangoFechas): void {
    if (!rango.inicio || !rango.fin) {
      return;
    }
    this.actualizarPeriodo((p) => ({ ...p, rango, personalizado: rango }));
  }

  editarBorrador(seleccion: SeleccionComparar): void {
    this._borrador.set(seleccion);
  }

  /** «Aplicar» del panel «Comparar»: lo marcado pasa a la gráfica y a las tablas. */
  aplicarComparacion(): void {
    this._aplicada.set(this._borrador());
    this._ocultas.set([]);
  }

  /** «Borrar» del panel «Comparar». */
  borrarComparacion(): void {
    this._borrador.set(SELECCION_VACIA);
    this._aplicada.set(SELECCION_VACIA);
    this._ocultas.set([]);
  }

  /** Retira un activo comparado (desde la leyenda o la tabla); el panel también lo desmarca. */
  retirarActivo(clave: string): void {
    this._aplicada.update((s) => quitarDeSeleccion(s, clave));
    this._borrador.update((s) => quitarDeSeleccion(s, clave));
    this._ocultas.set([]);
  }

  /** Series ocultas desde la leyenda: las tablas y la torta de portafolios también las ocultan. */
  ocultarSeries(claves: readonly string[]): void {
    this._ocultas.set(claves);
  }

  /** «Filtrar» de la pestaña Portafolios (categorías o productos marcados). */
  filtrar(valores: readonly string[]): void {
    this._filtro.set(valores);
    this._ocultas.set([]);
  }

  guardarColumnas(columnas: ValoresCasillas): void {
    this._columnas.update((c) => ({ ...c, [this._vista()]: columnas }));
  }

  /** Detalle de un portafolio de Óscar (con TIR). */
  abrirDetallePortafolio(clave: string): void {
    const p = this.portafoliosCliente().find((x) => clavePortafolio(x) === clave);
    if (p) {
      this._detalle.set({ activo: p.detalle, ocultarTir: false });
    }
  }

  /** Detalle de un activo comparado (portafolio Skandia, mezcla o competencia), sin TIR. */
  abrirDetalleComparado(clave: string): void {
    const activo = definicionComparada(clave)?.detalle;
    if (activo) {
      this._detalle.set({ activo, ocultarTir: true });
    }
  }

  cerrarDetalle(): void {
    this._detalle.set(null);
  }

  abrirTransacciones(clave: string): void {
    this._transacciones.set(clave);
  }

  cerrarTransacciones(): void {
    this._transacciones.set(null);
  }

  private actualizarPeriodo(cambio: (p: PeriodoPestana) => PeriodoPestana): void {
    const vista = this._vista();
    this._periodos.update((ps) => ({ ...ps, [vista]: cambio(ps[vista]) }));
    this._ocultas.set([]);
  }
}
