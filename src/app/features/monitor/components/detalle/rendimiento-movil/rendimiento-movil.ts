import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Modal } from '@features/monitor/components/detalle/modal/modal';
import { TEXTOS } from '@features/monitor/constants/textos';
import { PeriodoDesempeno } from '@features/monitor/interfaces/detalle';
import { formatearNumero } from '@features/monitor/utils/formatos';

/** Medida de una tarjeta de periodo. */
interface Medida {
  etiqueta: string;
  valor: number | null;
}

/**
 * Desempeño de una mezcla en móvil a pantalla completa (`mobile-performance-modal` del exterior; en producción no
 * se abre desde ninguna parte). `periodos = null` pinta el error del servicio. Avisa `cerrar` con la flecha.
 */
@Component({
  selector: 'nc-mon-rendimiento-movil',
  imports: [ErrorServicio, Icono, Modal],
  templateUrl: './rendimiento-movil.html',
  styleUrl: './rendimiento-movil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RendimientoMovil {
  readonly nombre = input.required<string>();
  readonly periodos = input<readonly PeriodoDesempeno[] | null>([]);

  readonly cerrar = output<void>();

  protected medidas(p: PeriodoDesempeno): Medida[] {
    return [
      { etiqueta: TEXTOS.rendimiento.variacion, valor: p.variacion },
      { etiqueta: TEXTOS.rendimiento.volatilidad, valor: p.volatilidad },
      { etiqueta: TEXTOS.rendimiento.retorno, valor: p.retorno },
    ];
  }

  /** `number: '1.2-2'` (en-US). */
  protected numero(valor: number): string {
    return formatearNumero(valor, 2, 2, 'en-US');
  }
}
