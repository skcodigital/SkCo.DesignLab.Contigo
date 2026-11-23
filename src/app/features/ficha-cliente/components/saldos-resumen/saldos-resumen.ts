import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { KpiCard } from '@features/ficha-cliente/components/kpi-card/kpi-card';
import { TEXTOS_FICHA } from '@features/ficha-cliente/constants/textos';
import { ResumenSaldos } from '@features/ficha-cliente/interfaces/saldos';
import { MontoPipe } from '@features/ficha-cliente/pipes/monto-pipe';

/** "Total bajo gestión" con ojo y tooltip, botón Ampliar (móvil) y las cuatro tarjetas de saldos. */
@Component({
  selector: 'nc-saldos-resumen',
  imports: [KpiCard, MontoPipe],
  templateUrl: './saldos-resumen.html',
  styleUrl: './saldos-resumen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaldosResumen {
  readonly saldos = input.required<ResumenSaldos>();
  readonly oculto = input(false);
  readonly ampliado = input(false);
  /** Planeación Pro: saldos recogidos. */
  readonly recogidos = input(false);

  readonly alternarOjo = output<void>();
  readonly alternarAmpliado = output<void>();
  readonly alternarRecogidos = output<void>();

  protected readonly etiquetaOjo = computed(() =>
    this.oculto() ? TEXTOS_FICHA.ojo.mostrar : TEXTOS_FICHA.ojo.ocultar,
  );
  protected readonly textoRecoger = computed(() =>
    this.recogidos() ? TEXTOS_FICHA.saldos.ver : TEXTOS_FICHA.saldos.recoger,
  );
  protected readonly textoAmpliar = computed(() =>
    this.ampliado() ? TEXTOS_FICHA.ampliar.reducir : TEXTOS_FICHA.ampliar.ampliar,
  );
}
