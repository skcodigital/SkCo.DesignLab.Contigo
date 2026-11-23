import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Kpi } from '@features/ficha-cliente/interfaces/saldos';
import { MontoPipe } from '@features/ficha-cliente/pipes/monto-pipe';

/** Tarjeta de saldos por línea de negocio (Ahorro, Pensiones, Seguros, Crédito preaprobado). */
@Component({
  selector: 'nc-kpi-card',
  imports: [MontoPipe],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  readonly kpi = input.required<Kpi>();
  readonly oculto = input(false);
  /** Móvil: "Ampliar" muestra los datos secundarios. */
  readonly ampliado = input(false);
}
