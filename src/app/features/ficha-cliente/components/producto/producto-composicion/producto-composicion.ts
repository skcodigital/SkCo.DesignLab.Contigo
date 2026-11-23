import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FechaCorte } from '@features/ficha-cliente/components/producto/fecha-corte/fecha-corte';
import { FilaComposicion, SegmentoComposicion } from '@features/ficha-cliente/interfaces/composicion';
import { formatoDecimal, formatoPesos } from '@features/ficha-cliente/utils/montos';

/** "Composición y saldos": aviso, Composición / Standing allocation, fecha de corte, dona y tabla de portafolios. */
@Component({
  selector: 'nc-producto-composicion',
  imports: [FechaCorte],
  templateUrl: './producto-composicion.html',
  styleUrl: './producto-composicion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoComposicion {
  readonly segmento = input.required<SegmentoComposicion>();
  readonly filas = input.required<readonly FilaComposicion[]>();
  readonly gradiente = input.required<string>();
  readonly etiquetaDona = input.required<string>();
  readonly fechaCorte = input.required<Date>();
  readonly fechaCorteTexto = input.required<string>();
  readonly hoy = input.required<Date>();
  readonly minima = input.required<Date>();

  readonly elegirSegmento = output<SegmentoComposicion>();
  readonly elegirFechaCorte = output<Date>();

  /** Alterna entre dos clases con la misma animación para reiniciarla en cada cambio de fecha. */
  protected readonly animacion = signal<0 | 1 | 2>(0);
  /** Estado de los saldos (En proceso / Efectivo); se conserva al volver de Standing allocation. */
  protected readonly estado = signal<'proceso' | 'efectivo'>('efectivo');

  /** Filas de la tabla ya formateadas en pesos / decimales colombianos. */
  protected readonly filasVista = computed(() =>
    this.filas().map((f) => ({
      nombre: f.nombre,
      color: f.color,
      porcentaje: f.porcentaje,
      unidades: formatoDecimal(f.unidades, 2),
      valorUnidad: '$ ' + formatoDecimal(f.valorUnidad, 2),
      saldo: formatoPesos(f.saldo),
      rendimientos: formatoPesos(f.rendimientos),
      ea: formatoDecimal(f.ea, 2) + ' %',
    })),
  );

  protected alElegirFecha(fecha: Date): void {
    this.elegirFechaCorte.emit(fecha);
    this.animacion.update((a) => (a === 1 ? 2 : 1));
  }
}
