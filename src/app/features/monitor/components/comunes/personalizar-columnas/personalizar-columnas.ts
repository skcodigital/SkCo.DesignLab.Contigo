import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, model, output, signal } from '@angular/core';
import { Casillas } from '@features/monitor/components/comunes/casillas/casillas';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Popover } from '@features/monitor/components/comunes/popover/popover';
import { GrupoCasillas, ValoresCasillas } from '@features/monitor/interfaces/comunes';

/**
 * Botón «Personaliza» con el popover de columnas (`app-custom-table`). En producción lo elegido se guardaba en
 * IndexedDB; aquí vive en `columnasVisibles` (la página o su store lo conserva) y se aplica con «Aplicar».
 * Las columnas de `siempreVisibles` no se ofrecen y quedan siempre marcadas.
 */
@Component({
  selector: 'nc-mon-personalizar-columnas',
  imports: [Casillas, Icono, Popover],
  templateUrl: './personalizar-columnas.html',
  styleUrl: './personalizar-columnas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalizarColumnas {
  readonly grupo = input.required<GrupoCasillas>();
  readonly siempreVisibles = input<readonly string[]>([]);
  /** Columnas visibles aplicadas; `null` = nada guardado aún (todas visibles). */
  readonly columnasVisibles = model<ValoresCasillas | null>(null);

  /** Se aplicaron columnas nuevas. */
  readonly aplicar = output<ValoresCasillas>();

  protected readonly abierto = signal(false);

  protected readonly grupoVisible = computed<GrupoCasillas>(() => ({
    ...this.grupo(),
    opciones: this.grupo().opciones.filter((o) => !this.siempreVisibles().includes(o.valor)),
  }));

  /** Lo marcado en el popover (se conserva al cerrarlo sin aplicar, como el formulario de producción). */
  protected readonly borrador = linkedSignal<ValoresCasillas>(() => {
    const guardadas = this.columnasVisibles();
    return Object.fromEntries(this.grupoVisible().opciones.map((o) => [o.valor, guardadas?.[o.valor] ?? true]));
  });

  protected confirmar(): void {
    const columnas: Record<string, boolean> = { ...this.borrador() };
    this.siempreVisibles().forEach((clave) => (columnas[clave] = true));
    this.columnasVisibles.set(columnas);
    this.aplicar.emit(columnas);
    this.abierto.set(false);
  }
}
