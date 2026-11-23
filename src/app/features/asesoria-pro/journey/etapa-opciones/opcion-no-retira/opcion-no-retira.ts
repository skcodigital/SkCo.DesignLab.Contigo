import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TEXTOS_OPCIONES_ACUERDO } from '../../../constants/textos';
import { Retiro } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { pct, pesos } from '../../../utils/formato';

/** Caja «Si no retira» de Opciones (cajaNoRetira del prototipo). */
@Component({
  selector: 'nc-opcion-no-retira',
  template: `
    <article class="jw-o3">
      <h4>Si no retira</h4>
      <div class="jw-o3-cuerpo">
        <dl>
          <div><dt>Seguiría invertido</dt><dd>{{ pesos(k().D) }}</dd></div>
          <div><dt>Rentabilidad de los últimos 12 meses</dt><dd>{{ rentabilidad() }}</dd></div>
          <div class="tot"><dt>{{ etiqueta() }}</dt><dd>{{ pesos(renta()) }}</dd></div>
        </dl>
        <p class="jw-o3-nota">Estimado con la rentabilidad de los últimos 12 meses. No es una promesa de rendimiento.</p>
      </div>
    </article>
  `,
  styleUrl: './opcion-no-retira.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpcionNoRetira {
  private readonly st = inject(ConversacionesStore).st;

  readonly k = input.required<Retiro>();

  /** Meses del plazo elegido (sin plazo, 12). */
  private readonly meses = computed(() => {
    const st = this.st();
    return st.plazo && !st.noRepone ? st.plazo : 12;
  });
  protected readonly renta = computed(() => this.k().D * (Math.pow(1 + this.k().tasa, this.meses() / 12) - 1));
  protected readonly etiqueta = computed(() => TEXTOS_OPCIONES_ACUERDO.rentaria(this.meses()));
  protected readonly rentabilidad = computed(() => pct(this.k().tasa * 100, 2) + ' E.A.');
  protected readonly pesos = pesos;
}
