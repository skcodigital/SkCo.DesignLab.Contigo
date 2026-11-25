import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { TEXTOS } from '@features/monitor/constants/textos';
import { FormatoRegional, PeriodoRendimiento, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { formatearNumero } from '@features/monitor/utils/formatos';

/** Una medida de la tarjeta (variación, volatilidad o retorno). */
interface Medida {
  etiqueta: string;
  valor: number | null;
}

/**
 * Tarjetas de rendimiento por periodo (`performance-cards`), la versión móvil de la tabla de rendimientos: TEA
 * arriba a la derecha y variación, volatilidad y retorno con flecha de subida o bajada. Los números siguen el
 * formato regional de cada vista (`1,23` en el cliente, `1.23` en el exterior).
 */
@Component({
  selector: 'nc-mon-tarjetas-rendimiento',
  imports: [ErrorServicio, Icono],
  templateUrl: './tarjetas-rendimiento.html',
  styleUrl: './tarjetas-rendimiento.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetasRendimiento {
  readonly datos = input<readonly PeriodoRendimiento[]>([]);
  readonly conError = input(false);
  readonly vista = input<VistaMonitor>('cliente');

  private readonly formato = computed<FormatoRegional>(() => (this.vista() === 'cliente' ? 'es-CO' : 'en-US'));

  protected medidas(p: PeriodoRendimiento): Medida[] {
    return [
      { etiqueta: TEXTOS.rendimiento.variacion, valor: p.variacion },
      { etiqueta: TEXTOS.rendimiento.volatilidad, valor: p.volatilidad },
      { etiqueta: TEXTOS.rendimiento.retorno, valor: p.retorno },
    ];
  }

  protected numero(valor: number): string {
    return formatearNumero(valor, 2, 2, this.formato());
  }
}
