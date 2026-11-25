import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { PersonalizarColumnas } from '@features/monitor/components/comunes/personalizar-columnas/personalizar-columnas';
import { GrupoCasillas, ValoresCasillas } from '@features/monitor/interfaces/comunes';

/**
 * Encabezado de «Indicadores por contrato» y «Indicadores por portafolio» (`tableHeader` de la página): título y
 * periodo elegido (en móvil, solo el título), «Personaliza» y «Copiar tabla».
 */
@Component({
  selector: 'nc-mon-encabezado-tabla',
  imports: [Icono, PersonalizarColumnas],
  templateUrl: './encabezado-tabla.html',
  styleUrl: './encabezado-tabla.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncabezadoTabla {
  readonly titulo = input('');
  readonly etiquetaPeriodo = input('');
  readonly casillas = input.required<GrupoCasillas>();
  readonly columnas = input<ValoresCasillas | null>(null);

  readonly aplicarColumnas = output<ValoresCasillas>();
  readonly copiar = output<void>();
}
