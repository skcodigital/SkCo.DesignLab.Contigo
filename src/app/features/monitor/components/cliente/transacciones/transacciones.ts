import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { injectMediaQuery } from '@core/utils/media-query';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { PersonalizarColumnas } from '@features/monitor/components/comunes/personalizar-columnas/personalizar-columnas';
import { Tabla } from '@features/monitor/components/comunes/tabla/tabla';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { Modal } from '@features/monitor/components/detalle/modal/modal';
import { TEXTOS } from '@features/monitor/constants/textos';
import { FilaPortafolio, PortafolioCliente, ProductoContrato } from '@features/monitor/interfaces/cliente';
import { RangoFechas, ValoresCasillas } from '@features/monitor/interfaces/comunes';
import { opcionesGraficaTransacciones, seriesTransacciones } from '@features/monitor/utils/cliente-grafica-transacciones';
import {
  CASILLAS_TRANSACCIONES,
  COLUMNAS_TRANSACCIONES,
  filasTransacciones,
  hayDevoluciones,
  opcionesTablaTransacciones,
} from '@features/monitor/utils/cliente-transacciones';
import { formatearNumero } from '@features/monitor/utils/formatos';

/**
 * Visor de transacciones de un portafolio (`transaction-info`, en una modal de 1140px): VUPC, VUPV y VUA con su
 * variación, «Ocultar devoluciones», «Personaliza», «Copiar tabla», cambio de orientación (gráfica y tabla lado a
 * lado o una debajo de la otra), la gráfica del periodo y la tabla de movimientos. Se cierra con la «x», Escape o
 * un clic por fuera.
 */
@Component({
  selector: 'nc-mon-transacciones',
  imports: [Grafica, Icono, Modal, PersonalizarColumnas, Tabla, Tooltip],
  templateUrl: './transacciones.html',
  styleUrl: './transacciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transacciones {
  readonly portafolio = input.required<PortafolioCliente>();
  readonly fila = input.required<FilaPortafolio>();
  readonly rango = input.required<RangoFechas>();
  readonly productos = input<readonly ProductoContrato[]>([]);
  readonly hoy = input<Date>(new Date());

  readonly cerrar = output<void>();

  private readonly avisos = inject(AvisoStore);
  private readonly esMovil = injectMediaQuery('(max-width: 768px)');
  private readonly tabla = viewChild(Tabla);

  protected readonly casillas = CASILLAS_TRANSACCIONES;
  protected readonly ocultarDevoluciones = signal(false);
  protected readonly horizontal = signal(true);
  protected readonly columnas = signal<ValoresCasillas | null>(null);

  protected readonly conDevoluciones = computed(() => hayDevoluciones(this.portafolio(), this.rango()));

  protected readonly opcionesTabla = computed(() =>
    opcionesTablaTransacciones(
      filasTransacciones(this.portafolio(), this.rango(), this.hoy(), this.ocultarDevoluciones()),
      this.columnas() ?? COLUMNAS_TRANSACCIONES,
      this.productos(),
    ),
  );

  private readonly series = computed(() =>
    seriesTransacciones(this.portafolio(), this.fila(), this.rango(), this.hoy(), this.ocultarDevoluciones()),
  );
  protected readonly sinDatos = computed(() => this.series().length === 0);
  protected readonly opcionesGrafica = computed(() =>
    opcionesGraficaTransacciones(this.series(), this.esMovil(), () => this.avisos.mostrar(TEXTOS.sinDescargas)),
  );

  /** `number: '1.0-2'` (con la configuración regional del cliente). */
  protected valor(v: number | null): string {
    return v === null ? '' : formatearNumero(v, 0, 2, 'es-CO');
  }

  /** `number: '1.2-2'`. */
  protected variacion(v: number): string {
    return formatearNumero(v, 2, 2, 'es-CO');
  }

  protected copiar(): void {
    this.tabla()?.copiarTabla();
  }
}
