import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icono } from '../../../components/icono/icono';
import { ADV_USTED, TEXTOS_DETALLE } from '../../../constants/textos';
import { etiquetaContrato } from '../../../data/contratos.mock';
import { Contrato } from '../../../interfaces/contrato';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { esp } from '../../../utils/calculos';
import { pesos } from '../../../utils/formato';

/** Pestaña Contrato: saldo, disponible (con su desglose), retención contingente y lo que ha ganado. */
@Component({
  selector: 'nc-tab-contrato',
  imports: [Icono],
  templateUrl: './tab-contrato.html',
  styleUrl: './tab-contrato.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabContrato {
  protected readonly store = inject(ConversacionesStore);
  readonly contrato = input.required<Contrato>();

  protected readonly pesos = pesos;
  protected readonly etiqueta = etiquetaContrato;
  protected readonly advertencia = ADV_USTED;
  protected readonly st = this.store.st;
  protected readonly especial = computed(() => esp(this.st()));
  /** Saldo en fondos cerrados (certificados a término y portafolios que no se pueden retirar). */
  protected readonly cerrados = computed(() => {
    const c = this.contrato();
    return Math.max(0, c.saldo - c.sc - c.disp);
  });
  protected readonly textoDesglose = computed(() =>
    this.st().verCalc ? TEXTOS_DETALLE.ocultarCalculo : TEXTOS_DETALLE.verCalculo,
  );
}
