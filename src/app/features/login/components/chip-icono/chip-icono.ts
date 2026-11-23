import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoChip } from '../../interfaces/login.interfaces';

/** Íconos (lucide) de los chips del carrusel del login, incluidos los de las diapositivas guardadas. */
@Component({
  selector: 'nc-chip-icono',
  templateUrl: './chip-icono.html',
  styles: `
    :host {
      display: contents;
    }

    svg {
      flex: none;
      color: var(--sk-color-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipIcono {
  readonly nombre = input.required<IconoChip>();
}
