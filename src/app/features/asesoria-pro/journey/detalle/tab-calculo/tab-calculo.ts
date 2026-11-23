import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icono } from '../../../components/icono/icono';
import { MONTO_REFERENCIA } from '../../../data/contratos.mock';
import { Contrato } from '../../../interfaces/contrato';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { aniosTxt, esp, retiro } from '../../../utils/calculos';
import { pesos } from '../../../utils/formato';

/** Pestaña Cálculo: el retiro paso a paso y de qué portafolios y aportes sale. */
@Component({
  selector: 'nc-tab-calculo',
  imports: [Icono],
  templateUrl: './tab-calculo.html',
  styleUrl: './tab-calculo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabCalculo {
  private readonly store = inject(ConversacionesStore);
  readonly contrato = input.required<Contrato>();

  protected readonly pesos = pesos;
  protected readonly st = this.store.st;
  protected readonly especial = computed(() => esp(this.st()));
  protected readonly k = computed(() => retiro(this.st(), this.contrato()));
  /** Cobro por permanencia estimado para lo que recibe. */
  protected readonly permanencia = computed(() => ((this.contrato().perm ?? 0) * this.k().R) / MONTO_REFERENCIA);
  protected readonly porPortafolio = computed(() => {
    const c = this.contrato();
    const totP = c.port.reduce((a, x) => a + x.saldo, 0);
    return c.port.map((x) => ({ nombre: x.nombre, valor: (x.saldo * this.k().D) / totP }));
  });
  protected readonly tramos = computed(() => {
    const k = this.k();
    return (
      [
        ['Exento', k.ex],
        ['Sin retención al retirar', k.sr],
        ['Con retención contingente', k.cc],
      ] as const
    ).filter((x) => x[1] > 0.5);
  });
  protected readonly anios = computed(() => aniosTxt(this.contrato(), this.k()));
}
