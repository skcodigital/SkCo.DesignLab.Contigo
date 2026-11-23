import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PESTANAS_FICHA } from '@features/ficha-cliente/constants/pestanas';
import { PestanaFichaId } from '@features/ficha-cliente/interfaces/pestanas';

/** Pestañas de la ficha (en móvil se ven como filas que abren cada sección como pantalla aparte). */
@Component({
  selector: 'nc-ficha-tabs',
  templateUrl: './ficha-tabs.html',
  styleUrl: './ficha-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FichaTabs {
  readonly activa = input.required<PestanaFichaId>();
  readonly elegir = output<PestanaFichaId>();

  protected readonly pestanas = PESTANAS_FICHA;

  protected alTeclado(e: KeyboardEvent, id: PestanaFichaId): void {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this.elegir.emit(id);
  }
}
