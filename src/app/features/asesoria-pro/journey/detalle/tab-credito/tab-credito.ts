import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { JourneyUiStore } from '../../journey-ui.store';
import { Icono } from '../../../components/icono/icono';
import { TASA_TXT } from '../../../constants/textos';
import { CREDITO_MIN, nombreContrato, TASA_CREDITO, TOPE_CREDITO, URL_ADMISIBILIDAD } from '../../../data/contratos.mock';
import { HOY } from '../../../data/conversaciones.mock';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { bloqueosCredito, combo, creditoPanel, ctSel, simCredito } from '../../../utils/calculos';
import { deIso, fLarga, iso, masDias, pesos } from '../../../utils/formato';
import { soloLectura } from '../../../utils/validaciones';

/** Pestaña Crédito: simulador del Crédito Impulso (monto, fecha de pago, abono parcial) y contratos de respaldo. */
@Component({
  selector: 'nc-tab-credito',
  imports: [Icono],
  templateUrl: './tab-credito.html',
  styleUrl: './tab-credito.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabCredito {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  /** «Opción seleccionada» cuando el cliente prefiere el Crédito Impulso (o la combinación). */
  protected readonly seleccionada = computed(() =>
    this.deCombo() ? this.st().pref === 'combo' : this.st().pref === 'credito',
  );
  /** «¿Por qué debo tener un respaldo?» desplegable. */
  protected readonly verPorque = signal(false);

  /** En el prototipo aún no se cambian los contratos de respaldo. */
  protected cambiarRespaldo(): void {
    this.ui.toast('info', 'Cambiar el respaldo', 'Elegir otros contratos de respaldo llegará muy pronto.');
  }

  protected readonly pesos = pesos;
  protected readonly nombre = nombreContrato;
  protected readonly fLarga = fLarga;
  protected readonly tasa = TASA_TXT;
  protected readonly tope = TOPE_CREDITO;
  protected readonly montoMin = Math.min(CREDITO_MIN, TOPE_CREDITO);
  protected readonly urlAdmisibilidad = URL_ADMISIBILIDAD;
  protected readonly hoy = HOY;
  protected readonly hoyIso = iso(HOY);
  protected readonly vence = masDias(360);
  protected readonly venceIso = iso(this.vence);

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  /** Sin monto o con vivienda solo se muestran el título y el subtítulo. */
  protected readonly visible = computed(() => this.st().monto > 0 && this.st().motivo !== 'vivienda');
  /** Abierto desde «Retiro + Crédito Impulso»: muestra el crédito de la combinación. */
  protected readonly deCombo = computed(() => this.ui.detalle()?.credito === 'combo');
  protected readonly sim = computed(() => {
    const st = this.st();
    const cb = this.deCombo() ? combo(st, ctSel(st)) : null;
    if (!cb) return simCredito(st);
    return {
      para: st.monto, monto: cb.M, fecha: iso(cb.cr.pago), abono: false, fAbono: iso(HOY),
      vAbono: Math.round(cb.M / 2 / 100000) * 100000,
    };
  });
  protected readonly s = computed(() => creditoPanel(this.sim()));
  protected readonly pago = computed(() => deIso(this.sim().fecha));
  protected readonly alVencimiento = computed(() => iso(this.pago()) === this.venceIso);
  protected readonly respaldo = computed(() => bloqueosCredito(this.s().resp));
  /** Intereses de renovar al vencimiento si no hace abonos. */
  protected readonly renovacion = computed(() =>
    Math.floor(this.s().cap * (Math.pow(1 + TASA_CREDITO, 360 / 365) - 1)),
  );

  /** Monto mientras se arrastra el control (solo la etiqueta; se aplica al soltar). */
  private readonly arrastre = signal<number | null>(null);
  protected readonly montoEtiqueta = computed(() => this.arrastre() ?? this.s().M);

  protected arrastrarMonto(e: Event): void {
    this.arrastre.set(+(e.target as HTMLInputElement).value);
  }

  protected soltarMonto(e: Event): void {
    this.store.ajustarCredito({ monto: +(e.target as HTMLInputElement).value });
    this.arrastre.set(null);
  }

  protected fechaPago(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    if (v) this.store.ajustarCredito({ fecha: v });
  }

  protected abono(e: Event): void {
    this.store.ajustarCredito({ abono: (e.target as HTMLInputElement).checked });
  }

  protected fechaAbono(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    if (v) this.store.ajustarCredito({ fAbono: v });
  }

  protected valorAbono(e: Event): void {
    this.store.ajustarCredito({ vAbono: Math.max(0, +(e.target as HTMLInputElement).value || 0) });
  }

  protected fechaLarga(s: string): string {
    return fLarga(deIso(s));
  }
}
