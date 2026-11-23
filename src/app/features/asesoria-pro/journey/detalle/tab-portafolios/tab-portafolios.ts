import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RENT_PER } from '../../../data/contratos.mock';
import { Contrato } from '../../../interfaces/contrato';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { pct, pesos } from '../../../utils/formato';

/** Pestaña Portafolios: saldo por portafolio, participación y rentabilidad por período. */
@Component({
  selector: 'nc-tab-portafolios',
  templateUrl: './tab-portafolios.html',
  styleUrl: './tab-portafolios.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPortafolios {
  protected readonly store = inject(ConversacionesStore);
  readonly contrato = input.required<Contrato>();

  protected readonly pesos = pesos;
  protected readonly periodos = RENT_PER;
  protected readonly st = this.store.st;
  protected readonly total = computed(() => this.contrato().port.reduce((a, x) => a + x.saldo, 0));
  private readonly ajuste = computed(() => RENT_PER.find((r) => r[0] === this.st().rentPer)?.[2] ?? 0);

  protected rentabilidad(r: number | null): string {
    return r == null ? '—' : pct(r + this.ajuste(), 2);
  }
}
