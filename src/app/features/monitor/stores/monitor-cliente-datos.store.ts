import { computed, inject, Injectable } from '@angular/core';
import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { ContratoGrafica } from '@features/monitor/interfaces/detalle';
import { MonitorClienteStore } from '@features/monitor/stores/monitor-cliente.store';
import { listaActivos, tituloMezclas } from '@features/monitor/utils/cliente-comparacion';
import {
  filasContratos,
  filasFondosContratos,
  hayTirCero,
  tortaContratos,
} from '@features/monitor/utils/cliente-contratos';
import { filaMezclaExpandible, filasCompararPortafolios, filasMezclas } from '@features/monitor/utils/cliente-filas';
import {
  coloresSeries,
  contratosPortafolios,
  filasPortafolios,
  filasVisibles,
  filtrarPorProductos,
  gruposFiltro,
  recolorearComparacion,
  tortaPortafolios,
} from '@features/monitor/utils/cliente-portafolios';
import { PERIODO_CLIENTE } from '@features/monitor/utils/cliente-periodos';
import { opcionesTablaPortafolios } from '@features/monitor/utils/cliente-tabla-portafolios';
import {
  casillasContratos,
  opcionesTablaCompararPortafolios,
  opcionesTablaContratos,
  opcionesTablaMezclas,
} from '@features/monitor/utils/cliente-tablas';
import {
  armarGraficaContratos,
  contratoComparado,
  contratoDecorativo,
  contratosEnRango,
} from '@features/monitor/utils/detalle-contratos';

/**
 * Datos que pinta la página del Monitor del cliente, derivados del estado de `MonitorClienteStore` (cero I/O; se
 * provee en la página): gráficas, tortas y tablas de cada pestaña y la tabla de lo comparado.
 *
 * Las series de las gráficas no dependen de las series ocultas: si dependieran, ocultar una desde la leyenda
 * volvería a pintar la gráfica y la leyenda se reiniciaría.
 */
@Injectable()
export class MonitorClienteDatos {
  private readonly s = inject(MonitorClienteStore);

  // ───────────── Contratos ─────────────

  private readonly rangoContratos = computed(() => this.s.periodos().contratos.rango);

  /** Contratos propios y lo comparado, como series de la gráfica de contratos. */
  readonly contratosGrafica = computed<ContratoGrafica[]>(() => [
    ...contratosEnRango(this.s.contratosCliente(), this.rangoContratos(), this.s.hoy, this.s.paleta, this.s.plazo()),
    ...listaActivos(this.s.activos()).map(contratoComparado),
  ]);

  private readonly coloresContratos = computed(() => coloresSeries(this.contratosGrafica()));

  /** Sin contratos con datos ni portafolios, indicadores o mezclas agregados: la gráfica muestra el aviso. */
  readonly sinProductos = computed(() => {
    const a = this.s.activos();
    const propios = this.contratosGrafica().some((c) => !c.removible && c.puntos.length > 0);
    const agregados = [...a.fondos, ...a.indicadores, ...a.mezclas].some((x) => x.puntos.length > 0);
    return !propios && !agregados;
  });

  readonly mensajeSinProductos = computed(() =>
    this.s.aplicada().mezclas.length ? TEXTOS_CLIENTE.sinDatosMezclas : TEXTOS_CLIENTE.sinPortafolios,
  );

  readonly tortaContratos = computed(() => tortaContratos(this.s.contratosCliente(), this.s.productos, this.s.paleta));

  private readonly conRendimientos = computed(() => this.s.periodos().contratos.periodo === PERIODO_CLIENTE.desdeElInicio);

  readonly filasContratos = computed(() => [
    ...filasContratos(
      this.s.contratosCliente(),
      this.s.productos,
      this.rangoContratos(),
      this.s.hoy,
      this.s.paleta,
      this.s.ocultas(),
      this.conRendimientos(),
    ),
    ...filasFondosContratos(this.s.activos().fondos, this.coloresContratos(), this.s.ocultas()),
  ]);

  readonly tablaContratos = computed(() =>
    opcionesTablaContratos(this.filasContratos(), this.conRendimientos(), this.s.columnas().contratos),
  );
  readonly casillasContratos = computed(() => casillasContratos(this.conRendimientos()));
  readonly tirCero = computed(() => hayTirCero(this.filasContratos()));

  // ───────────── Portafolios ─────────────

  private readonly rangoPortafolios = computed(() => this.s.periodos().portafolios.rango);

  private readonly todasPortafolios = computed(() =>
    filasPortafolios(this.s.portafoliosCliente(), this.rangoPortafolios(), this.s.hoy, this.s.paleta),
  );
  private readonly filtradas = computed(() => filtrarPorProductos(this.todasPortafolios(), this.s.filtro()));

  /** Filas de «Indicadores por portafolio» (sin las series ocultas, con su porcentaje). */
  readonly filasPortafolios = computed(() => filasVisibles(this.filtradas(), this.s.ocultas()));
  readonly tortaPortafolios = computed(() => tortaPortafolios(this.filasPortafolios()));
  readonly tablaPortafolios = computed(() => opcionesTablaPortafolios(this.filasPortafolios(), this.s.columnas().portafolios));
  readonly gruposFiltro = computed(() => gruposFiltro(this.todasPortafolios()));
  readonly fechaCorte = computed(() => this.filasPortafolios()[0]?.fechaCorte ?? null);

  /** Series de la gráfica de portafolios: los propios (filtrados) y lo comparado. */
  readonly portafoliosGrafica = computed<ContratoGrafica[]>(() => {
    const a = this.s.activos();
    const propios = contratosPortafolios(
      this.filtradas(),
      this.s.portafoliosCliente(),
      this.rangoPortafolios(),
      this.s.hoy,
      this.s.plazo(),
    );
    const agregados = [...a.fondos, ...a.indicadores, ...a.mezclas].map(contratoComparado);
    const superpuestos = [...a.referencias, ...a.cdt].map(contratoComparado);
    return [...recolorearComparacion(propios, agregados, this.s.paleta), ...superpuestos];
  });

  /** Sin portafolios con datos ni nada comparado: serie decorativa y aviso. */
  readonly sinPortafolios = computed(() => !this.portafoliosGrafica().some((c) => c.puntos.length > 0));

  readonly datosGraficaPortafolios = computed(() =>
    this.sinPortafolios()
      ? armarGraficaContratos([contratoDecorativo(this.s.hoy, this.s.paleta[0])])
      : armarGraficaContratos(this.portafoliosGrafica(), this.s.modoTasa()),
  );

  private readonly coloresPortafolios = computed(() => coloresSeries(this.portafoliosGrafica()));

  readonly tablaCompararPortafolios = computed(() => {
    const filas = filasCompararPortafolios(this.s.activos().fondos, this.coloresPortafolios(), this.s.ocultas());
    return filas.length ? opcionesTablaCompararPortafolios(filas) : null;
  });

  // ───────────── Lo comparado (las dos pestañas) ─────────────

  private readonly filasMezclas = computed(() =>
    filasMezclas(
      this.s.activos(),
      this.s.vista(),
      this.s.esContratos() ? this.coloresContratos() : this.coloresPortafolios(),
      this.s.ocultas(),
    ),
  );

  /** Tabla «Mezcla Invest-ed, Competencia, CDTs e Indicadores» (`null`: no hay nada que mostrar). */
  readonly tablaMezclas = computed(() =>
    this.filasMezclas().length ? opcionesTablaMezclas(this.filasMezclas(), filaMezclaExpandible) : null,
  );

  readonly tituloMezclas = computed(() => {
    const a = this.s.activos();
    const conDatos = (lista: readonly { metricas: unknown }[]): boolean => lista.some((x) => !!x.metricas);
    return tituloMezclas(
      { competencia: conDatos(a.referencias), cdt: conDatos(a.cdt), indicadores: conDatos(a.indicadores) },
      TEXTOS_CLIENTE.tituloMezclas,
    );
  });

  /** Hay CDT en la tabla: aviso de la tasa promedio ponderada debajo. */
  readonly hayCdtEnTabla = computed(() => this.s.activos().cdt.some((x) => !!x.metricas));
}
