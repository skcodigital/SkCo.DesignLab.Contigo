import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { RUTAS } from '@core/constants/rutas';
import { AvisoStore } from '@core/state/aviso.store';
import { injectMediaQuery } from '@core/utils/media-query';
import { AccionesPeriodo } from '@features/monitor/components/cliente/acciones-periodo/acciones-periodo';
import { AvisoCliente } from '@features/monitor/components/cliente/aviso-cliente/aviso-cliente';
import { BotonComparar } from '@features/monitor/components/cliente/boton-comparar/boton-comparar';
import { CambioVista } from '@features/monitor/components/cliente/cambio-vista/cambio-vista';
import { FiltroPortafolios } from '@features/monitor/components/cliente/filtro-portafolios/filtro-portafolios';
import { SeccionComparados } from '@features/monitor/components/cliente/seccion-comparados/seccion-comparados';
import { SeccionIndicadores } from '@features/monitor/components/cliente/seccion-indicadores/seccion-indicadores';
import { Transacciones } from '@features/monitor/components/cliente/transacciones/transacciones';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { GraficaLineas } from '@features/monitor/components/comunes/grafica-lineas/grafica-lineas';
import { GraficaSinDatos } from '@features/monitor/components/comunes/grafica-sin-datos/grafica-sin-datos';
import { GraficaTorta } from '@features/monitor/components/comunes/grafica-torta/grafica-torta';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { Detalle } from '@features/monitor/components/detalle/detalle/detalle';
import { GraficaContratos } from '@features/monitor/components/detalle/grafica-contratos/grafica-contratos';
import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { EventoFila, FilaTabla } from '@features/monitor/interfaces/comunes';
import { MonitorClienteDatos } from '@features/monitor/stores/monitor-cliente-datos.store';
import { escenarioDesdeUrl, MonitorClienteStore } from '@features/monitor/stores/monitor-cliente.store';
import { filaMezclaExpandible } from '@features/monitor/utils/cliente-filas';
import { clavePortafolio } from '@features/monitor/utils/cliente-portafolios';
import { CASILLAS_PORTAFOLIOS } from '@features/monitor/utils/cliente-tabla-portafolios';

const clave = (f: FilaTabla): string => String(f['clave'] ?? '');

/**
 * Monitor Contigo del cliente (`/ficha/monitor`, el `<monitor-element>` de producción) dentro de la ficha de Óscar:
 * pestañas Contratos y Portafolios con su periodo, «Comparar», torta de composición, gráfica de comportamiento,
 * tablas de indicadores y de lo comparado, visor de transacciones y detalle de cada activo.
 *
 * El estado vive en `MonitorClienteStore` y los datos en `MonitorClienteDatos` (los dos se proveen aquí). En el
 * laboratorio `?estado=error` muestra el error de los servicios y `?estado=sin-datos`, un cliente sin productos.
 */
@Component({
  selector: 'nc-monitor-cliente-page',
  imports: [
    AccionesPeriodo,
    AvisoCliente,
    BotonComparar,
    CambioVista,
    Detalle,
    ErrorServicio,
    FiltroPortafolios,
    GraficaContratos,
    GraficaLineas,
    GraficaSinDatos,
    GraficaTorta,
    Icono,
    SeccionComparados,
    SeccionIndicadores,
    Tooltip,
    Transacciones,
  ],
  templateUrl: './monitor-cliente-page.html',
  styleUrl: './monitor-cliente-page.scss',
  providers: [MonitorClienteStore, MonitorClienteDatos],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorClientePage {
  /** Escenario del laboratorio (`?estado=` de la URL). */
  readonly estado = input<string>();

  protected readonly store = inject(MonitorClienteStore);
  protected readonly datos = inject(MonitorClienteDatos);
  private readonly avisos = inject(AvisoStore);
  private readonly router = inject(Router);

  /** Bajo 768px el periodo y «Comparar» bajan debajo de la torta. */
  protected readonly esMovil = injectMediaQuery('(max-width: 767.98px)');
  protected readonly textos = TEXTOS_CLIENTE;
  protected readonly casillasPortafolios = CASILLAS_PORTAFOLIOS;

  /** Portafolio cuyo visor de transacciones está abierto. */
  protected readonly transaccion = computed(() => {
    const abierta = this.store.transacciones();
    const fila = this.datos.filasPortafolios().find((f) => f.clave === abierta);
    const portafolio = this.store.portafoliosCliente().find((p) => clavePortafolio(p) === abierta);
    return fila && portafolio ? { fila, portafolio } : null;
  });

  constructor() {
    // La URL es externa a la página: el escenario se sincroniza con el estado.
    effect(() => this.store.definirEscenario(escenarioDesdeUrl(this.estado())));
  }

  protected sinDescargas(): void {
    this.avisos.mostrar(TEXTOS.sinDescargas);
  }

  /** Nombre de un contrato: abre su ficha; de un portafolio comparado: su detalle. */
  protected alNombreContrato(e: EventoFila): void {
    if (e.clave !== 'nombre') {
      return;
    }
    if (e.fila['contrato']) {
      const tipo = e.fila['tipoProducto'];
      void this.router.navigate(['/', RUTAS.ficha, RUTAS.producto], tipo === 'fic' ? { queryParams: { tipo } } : {});
    } else if (clave(e.fila)) {
      this.store.abrirDetalleComparado(clave(e.fila));
    }
  }

  /** Transacciones (si hay) o detalle del portafolio. */
  protected alCeldaPortafolio(e: EventoFila): void {
    if (e.clave === 'transacciones' && Number(e.fila['transacciones']) > 0) {
      this.store.abrirTransacciones(clave(e.fila));
    } else if (e.clave === 'nombre') {
      this.store.abrirDetallePortafolio(clave(e.fila));
    }
  }

  /** «Descargar informe» de un portafolio: en el laboratorio no hay PDF. */
  protected alAccionPortafolio(e: EventoFila): void {
    if (e.clave === 'descargar') {
      this.sinDescargas();
    }
  }

  /** Solo las mezclas y la competencia abren su detalle. */
  protected alNombreComparado(e: EventoFila): void {
    if (e.clave === 'nombre' && filaMezclaExpandible(e.fila)) {
      this.store.abrirDetalleComparado(clave(e.fila));
    }
  }

  protected alNombrePortafolioComparado(e: EventoFila): void {
    if (e.clave === 'nombre') {
      this.store.abrirDetalleComparado(clave(e.fila));
    }
  }

  protected alRetirar(e: EventoFila): void {
    if (e.clave === 'retirar') {
      this.store.retirarActivo(clave(e.fila));
    }
  }
}
