import { computed, Injectable, signal } from '@angular/core';
import { EstadoSaldos, SegmentoComposicion, VistaComposicion } from '../interfaces/composicion';
import { TipoProducto } from '../interfaces/productos';
import { FECHA_HOY, FECHA_MINIMA, PORTAFOLIOS } from '../data/composicion.mock';
import { PRODUCTOS } from '../data/productos.mock';
import { calcularComposicion, etiquetaDona, filasTabla, gradienteDona, totalSaldos } from '../utils/composicion';
import { formatoFechaCorta } from '../utils/fechas';
import { formatoPesos } from '../utils/montos';

/** Estado de "Composición y saldos" de la ficha del producto. Se provee en la página del producto. */
@Injectable()
export class ProductoStore {
  readonly hoy = FECHA_HOY;
  readonly minima = FECHA_MINIMA;

  private readonly _tipo = signal<TipoProducto>('mf');
  private readonly _segmento = signal<SegmentoComposicion>('actual');
  private readonly _fechaCorte = signal<Date>(new Date(FECHA_HOY));
  private readonly _estado = signal<EstadoSaldos>('efectivo');

  readonly tipo = this._tipo.asReadonly();
  readonly segmento = this._segmento.asReadonly();
  readonly fechaCorte = this._fechaCorte.asReadonly();
  readonly estado = this._estado.asReadonly();

  private readonly calculadas = computed(() =>
    calcularComposicion(PORTAFOLIOS[this._tipo()], this.hoy, this._fechaCorte()),
  );

  readonly vista = computed<VistaComposicion>(() => {
    const filas = this.calculadas();
    const fecha = this._fechaCorte();
    return {
      tipo: this._tipo(),
      contrato: PRODUCTOS[this._tipo()].contrato,
      segmento: this._segmento(),
      estado: this._estado(),
      fecha,
      fechaTexto: formatoFechaCorta(fecha),
      filas: filasTabla(filas),
      total: formatoPesos(totalSaldos(filas)),
      gradiente: gradienteDona(filas),
      etiquetaDona: etiquetaDona(filas, fecha),
    };
  });

  /** Al abrir un producto: sus portafolios, vista Composición y corte a hoy. */
  cargarProducto(tipo: TipoProducto): void {
    this._tipo.set(tipo);
    this._segmento.set('actual');
    this._fechaCorte.set(new Date(FECHA_HOY));
  }

  elegirSegmento(segmento: SegmentoComposicion): void {
    this._segmento.set(segmento);
  }

  elegirFechaCorte(fecha: Date): void {
    this._fechaCorte.set(fecha);
  }

  elegirEstado(estado: EstadoSaldos): void {
    this._estado.set(estado);
  }
}
