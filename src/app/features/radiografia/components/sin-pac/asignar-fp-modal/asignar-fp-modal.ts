import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Dialogo } from '@features/radiografia/components/comunes/dialogo/dialogo';
import { IconoSpView } from '@features/radiografia/components/sin-pac/icono-sp/icono-sp';
import { CANDIDATOS_FP_SP } from '@features/radiografia/data/sin-pac.mock';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';

/**
 * Sin PAC: modal para asignar un FP a la empresa (elegir asesor → confirmación).
 * En el prototipo no hay botón que la abra todavía: se abre con `store.abrirAsignarFp()`.
 */
@Component({
  selector: 'nc-rx-asignar-fp-modal',
  imports: [Dialogo, IconoSpView],
  templateUrl: './asignar-fp-modal.html',
  styleUrl: './asignar-fp-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignarFpModal {
  protected readonly store = inject(RadiografiaStore);
  protected readonly candidatos = CANDIDATOS_FP_SP;
  /** Asesor marcado en la tabla (al abrir no hay ninguno y "Asignar como FP" está deshabilitado). */
  protected readonly elegido = signal<string | null>(null);
  /** Asesor ya asignado: la modal pasa a la confirmación. */
  protected readonly asignado = signal<string | null>(null);
  private readonly listo = viewChild<ElementRef<HTMLElement>>('listo');

  constructor() {
    // Al pasar a la confirmación, el foco va a ella (como `listo.focus()` del prototipo).
    afterRenderEffect(() => this.listo()?.nativeElement.focus());
  }

  protected confirmar(): void {
    const nombre = this.elegido();
    if (!nombre) return;
    this.store.asignarFp(nombre);
    this.asignado.set(nombre);
  }
}
