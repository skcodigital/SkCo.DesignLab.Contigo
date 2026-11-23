import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { NOM_CAJA, TEXTOS } from '../../constants/textos';
import { TipoCaja } from '../../interfaces/calculo';
import { ConversacionesStore } from '../../state/conversaciones.store';
import {
  cajaRx,
  cajas,
  cred,
  ctId,
  elegibles,
  impuesto,
  prefEsRetiro,
  retiroPref,
  tocaNoExento,
} from '../../utils/calculos';
import { pesos } from '../../utils/formato';
import { etapa3Completa, habilitada, soloLectura } from '../../utils/validaciones';
import { JourneyUiStore } from '../journey-ui.store';
import { OpcionCombo } from './opcion-combo/opcion-combo';
import { OpcionCredito } from './opcion-credito/opcion-credito';
import { OpcionNoRetira } from './opcion-no-retira/opcion-no-retira';
import { OpcionRetiro } from './opcion-retiro/opcion-retiro';

/**
 * Etapa 3 · Opciones (v5 del journey): cajas de retiro, crédito puente, retiro total, combinación y «Si no retira»;
 * la pregunta de renta exenta va en la caja del retiro. Termina con la preferencia del cliente.
 */
@Component({
  selector: 'nc-etapa-opciones',
  imports: [Icono, OpcionRetiro, OpcionCredito, OpcionCombo, OpcionNoRetira],
  templateUrl: './etapa-opciones.html',
  styleUrl: './etapa-opciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtapaOpciones {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  /** Sin monto no hay opciones: se pide en «Entender». */
  protected readonly falta = computed(() => !(this.st().monto > 0));
  protected readonly v = computed(() => cajas(this.st()));
  protected readonly cr = computed(() => cred(this.st()));
  /** Caja que lleva la pregunta de renta exenta y si el retiro toca aportes no exentos. */
  protected readonly rxEn = computed(() => cajaRx(this.st(), this.v().list));
  protected readonly conRx = computed(() => {
    const st = this.st();
    return tocaNoExento(st, prefEsRetiro(st) ? retiroPref(st) : this.v().k);
  });
  /** «Hoy puede retirar $X. Para cubrir $Y, la opción es el crédito puente.» */
  protected readonly alcanza = computed(() => {
    const st = this.st();
    const v = this.v();
    const cr = this.cr();
    const monto = st.monto || 0;
    const credEleg = !v.viv && !st.noRepone && cr.M > 0 && cr.M >= monto - 0.5;
    return credEleg && v.kt.R + v.kt.g < monto - 0.5 ? TEXTOS.alcanzaCredito(pesos(v.kt.R + v.kt.g), pesos(st.monto)) : null;
  });
  protected readonly anticipo = computed(() => {
    const st = this.st();
    const v = this.v();
    const ibc = v.list
      .filter((t) => t !== 'credito')
      .every((t) => impuesto(st, t === 'retiro' ? v.k : v.kt).nota === TEXTOS.notaIbc);
    return TEXTOS.anticipo(ibc);
  });
  protected readonly elegibles = computed(() => elegibles(this.st(), this.v(), this.cr()));
  protected readonly verCredito = computed(() => !this.v().viv && this.cr().M > 0);
  protected readonly pie = computed(() => etapa3Completa(this.st()) || this.ro());
  protected readonly nomCaja = NOM_CAJA;

  protected elegirPreferencia(t: TipoCaja): void {
    this.store.elegirPreferencia(t);
  }

  protected verCalculo(): void {
    this.ui.abrirDetalle(ctId(this.st()), 'calculo');
  }

  protected verDetalleCredito(): void {
    this.ui.abrirDetalle(ctId(this.st()), 'credito');
  }

  protected continuar(): void {
    if (habilitada(this.st(), 4)) this.store.irEtapa(4);
  }
}
