import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { Icono } from '../../../components/icono/icono';
import { TEXTOS, TEXTOS_DETALLE } from '../../../constants/textos';
import { TRAMOS } from '../../../data/contratos.mock';
import { Contrato, Tramo } from '../../../interfaces/contrato';
import { VistaAportes } from '../../../interfaces/conversacion';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { aportesDe, tramosQueSalen } from '../../../utils/aportes';
import { retiro } from '../../../utils/calculos';
import { pesos } from '../../../utils/formato';
import { JourneyUiStore } from '../../journey-ui.store';

const VISTAS: readonly (readonly [VistaAportes, string])[] = [['resumen', 'Resumen'], ['tabla', 'Tabla']];
const COLUMNAS = ['Fecha', 'Valor', 'Rendimientos', 'Saldo', 'Estado', 'Certificado', 'Trasladado', 'Retención contingente', 'Cumple 10 años'] as const;
const COPIADO_MS = 2000;

/** Pestaña Aportes: resumen por tramo (con lo que sale del retiro) o tabla de aportes. */
@Component({
  selector: 'nc-tab-aportes',
  imports: [Icono],
  templateUrl: './tab-aportes.html',
  styleUrl: './tab-aportes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabAportes {
  protected readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);
  readonly contrato = input.required<Contrato>();

  protected readonly pesos = pesos;
  protected readonly vistas = VISTAS;
  protected readonly columnas = COLUMNAS;
  protected readonly estados = TEXTOS_DETALLE.estadoAporte;
  protected readonly st = this.store.st;

  protected readonly tramos = computed(() => {
    const c = this.contrato();
    const tot = c.ex + c.sr + c.cc + c.sc;
    return TRAMOS.filter((t) => c[t.tipo] > 0).map((t: Tramo) => ({
      ...t,
      valor: c[t.tipo],
      ancho: ((c[t.tipo] / tot) * 100).toFixed(1) + '%',
    }));
  });
  protected readonly k = computed(() => retiro(this.st(), this.contrato()));
  protected readonly saldrian = computed(() => tramosQueSalen(this.k()));
  protected readonly aportes = computed(() => aportesDe(this.contrato()));
  protected readonly totales = computed(() => {
    const ap = this.aportes();
    return {
      valor: ap.reduce((a, x) => a + x.valor, 0),
      rend: ap.reduce((a, x) => a + x.rend, 0),
      saldo: ap.reduce((a, x) => a + x.saldo, 0),
    };
  });

  protected readonly etiquetaCopiar = signal<string>(TEXTOS.copiar);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected copiar(): void {
    this.etiquetaCopiar.set(TEXTOS.copiado);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.etiquetaCopiar.set(TEXTOS.copiar), COPIADO_MS);
  }

  protected descargar(): void {
    this.ui.toast('info', TEXTOS.toastExcel[0], TEXTOS.toastExcel[1]);
  }
}
