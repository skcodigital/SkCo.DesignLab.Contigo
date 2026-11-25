import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { FilaComparacion } from '@features/monitor/interfaces/detalle';
import { separarPlazoCdt, sentidoFlecha } from '@features/monitor/utils/detalle-comparacion';
import { formatearNumero } from '@features/monitor/utils/formatos';

/**
 * Fila del listado móvil de la comparación del Monitor exterior: punto, nombre (con el plazo del CDT debajo),
 * variación y TEA; al tocarla se despliegan valor inicial y final, volatilidad, retorno y «Más información».
 */
@Component({
  selector: 'nc-mon-item-comparacion',
  imports: [Icono],
  templateUrl: './item-comparacion.html',
  styleUrl: './item-comparacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComparacion {
  readonly fila = input.required<FilaComparacion>();
  readonly expandido = input(false);
  /** Muestra «Más información» (mezclas, portafolios Skandia y de la competencia). */
  readonly conDetalle = input(false);
  /** Hay un CDT elegido: el nombre se separa del plazo. */
  readonly conCdt = input(false);

  readonly alternar = output<void>();
  readonly masInformacion = output<void>();

  protected readonly plazo = computed(() => (this.conCdt() ? separarPlazoCdt(this.fila().nombre) : null));

  /** `number: '1.0-2'` (en-US). */
  protected numero(valor: unknown): string {
    return formatearNumero(valor as number | string, 0, 2, 'en-US');
  }

  /** `number: '1.2-2'` (en-US). */
  protected dinero(valor: unknown): string {
    return formatearNumero(valor as number | string, 2, 2, 'en-US');
  }

  protected flecha(valor: unknown): 'sube' | 'baja' | null {
    return sentidoFlecha(valor);
  }
}
