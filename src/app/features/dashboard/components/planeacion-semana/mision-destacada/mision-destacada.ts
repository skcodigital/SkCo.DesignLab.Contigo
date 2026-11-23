import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TEXTOS } from '../../../constants/textos';
import { Mision } from '../../../interfaces/mision';
import { formatearPesos, primerNombre } from '../../../utils/formato';
import { IconoOjo } from '../../icono-ojo/icono-ojo';

/**
 * Misión destacada del módulo ampliado: nombre (abre la ficha), saldo con el ojo, guía de Sami y acciones.
 * Sin etiqueta ni plazo: ya están en la lista de la izquierda.
 */
@Component({
  selector: 'nc-mision-destacada',
  imports: [IconoOjo],
  templateUrl: './mision-destacada.html',
  styleUrl: './mision-destacada.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-live': 'polite',
    '[class.oscuro]': 'oscuro()',
    '[class.oculto]': 'oculto()',
  },
})
export class MisionDestacada {
  readonly mision = input.required<Mision>();
  readonly oculto = input(true);
  readonly lectura = input(false);
  /** Variante oscura (`.pp-oscuro` del prototipo, la elegida). */
  readonly oscuro = input(true);

  readonly iniciar = output<void>();
  readonly verFicha = output<void>();
  readonly descartar = output<void>();
  readonly alternarOjo = output<void>();

  protected readonly saldo = computed(() => formatearPesos(this.mision().saldo));
  protected readonly guia = computed(() => TEXTOS.planeacion.guia(primerNombre(this.mision().nombre)));
  protected readonly ojo = computed(() => {
    const o = TEXTOS.ojo;
    return this.oculto()
      ? { aria: o.ariaMisiones.mostrar, tooltip: o.mostrar }
      : { aria: o.ariaMisiones.ocultar, tooltip: o.ocultar };
  });

  protected clicNombre(e: Event): void {
    e.preventDefault();
    this.verFicha.emit();
  }
}
