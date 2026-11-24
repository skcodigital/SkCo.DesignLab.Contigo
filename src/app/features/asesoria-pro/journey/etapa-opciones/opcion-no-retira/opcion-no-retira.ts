import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TEXTOS_OPCIONES_ACUERDO } from '../../../constants/textos';
import { Retiro } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { pct, pesos } from '../../../utils/formato';
import { soloLectura } from '../../../utils/validaciones';

/** Caja «Si no retira» de Opciones (cajaNoRetira del prototipo). */
@Component({
  selector: 'nc-opcion-no-retira',
  template: `
    <!-- Seleccionable como las demás cajas: radio + borde verde al elegirla -->
    <label class="jw-o3 jw-o3--sel" [class.elegida]="st().pref === 'noretira'">
      <span class="jw-o3-top"><input type="radio" name="jw-pref" value="noretira" [checked]="st().pref === 'noretira'" [disabled]="ro()" (change)="elegir()" /><h4>Si no retira</h4></span>
      <div class="jw-o3-cuerpo">
        <dl>
          <div><dt>Seguiría invertido</dt><dd>{{ pesos(k().D) }}</dd></div>
          <div><dt>Rentabilidad de los últimos 12 meses</dt><dd>{{ rentabilidad() }}</dd></div>
          <div class="tot"><dt>{{ etiqueta() }}</dt><dd>{{ pesos(renta()) }}</dd></div>
        </dl>
        <p class="jw-o3-nota">Estimado con la rentabilidad de los últimos 12 meses. No es una promesa de rendimiento.</p>
      </div>
    </label>
  `,
  styleUrl: './opcion-no-retira.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpcionNoRetira {
  private readonly store = inject(ConversacionesStore);
  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));

  protected elegir(): void {
    this.store.elegirPreferencia('noretira');
  }

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
