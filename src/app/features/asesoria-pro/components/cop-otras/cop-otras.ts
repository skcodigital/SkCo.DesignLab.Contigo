import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icono } from '../icono/icono';

/**
 * «Otras misiones»: por ahora solo el aviso de que vienen más herramientas de acompañamiento.
 * Si la misión ya no está (gestionada o descartada), «Acompañamiento al retirar» se puede volver a abrir desde aquí.
 */
@Component({
  selector: 'nc-cop-otras',
  imports: [Icono],
  templateUrl: './cop-otras.html',
  styleUrl: './cop-otras.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopOtras {
  readonly conRetiro = input(false);
  readonly abrirRetiro = output<void>();
}
