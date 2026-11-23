import { ChangeDetectionStrategy, Component, computed, ElementRef, input, output, viewChild } from '@angular/core';
import { FechaCorte } from '@features/ficha-cliente/components/producto/fecha-corte/fecha-corte';
import { EstadoSaldos } from '@features/ficha-cliente/interfaces/composicion';
import { AtajoFecha, fechasAtajo, mismoDia } from '@features/ficha-cliente/utils/fechas';

/** Caja "Saldos a otras fechas · Nuevo": fecha de corte, estado En proceso / Efectivo y atajos (ocultos por ahora). */
@Component({
  selector: 'nc-saldos-otras-fechas',
  imports: [FechaCorte],
  templateUrl: './saldos-otras-fechas.html',
  styleUrl: './saldos-otras-fechas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaldosOtrasFechas {
  readonly fecha = input.required<Date>();
  readonly fechaTexto = input.required<string>();
  readonly estado = input.required<EstadoSaldos>();
  readonly hoy = input.required<Date>();
  readonly minima = input.required<Date>();
  /** FIC: sin switch de composición arriba, la caja no lleva margen superior. */
  readonly fic = input(false);

  readonly elegirFecha = output<Date>();
  readonly elegirEstado = output<EstadoSaldos>();
  /** El asesor usó la función (calendario o estado): apaga el aviso de novedad. */
  readonly usar = output<void>();

  private readonly caja = viewChild.required<ElementRef<HTMLElement>>('caja');
  private readonly selector = viewChild.required(FechaCorte);

  private readonly fechas = computed(() => fechasAtajo(this.hoy()));
  protected readonly atajos = computed(() => {
    const f = this.fechas();
    const atajo = (id: AtajoFecha, etiqueta: string) => ({ id, etiqueta, activo: mismoDia(f[id], this.fecha()) });
    return [atajo('corte', 'Último corte'), atajo('mes', 'Fin de mes anterior'), atajo('anio', 'Fin de año anterior')];
  });

  /** Lleva al asesor a la caja desde el aviso de novedad. */
  enfocar(desplazar: boolean): void {
    if (desplazar) this.caja().nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.selector().enfocar();
  }

  protected alEstado(estado: EstadoSaldos): void {
    this.elegirEstado.emit(estado);
    this.usar.emit();
  }

  protected alAtajo(id: AtajoFecha): void {
    this.elegirFecha.emit(new Date(this.fechas()[id]));
  }
}
