import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Icono } from '../../components/icono/icono';
import { FUERA_DE_ALCANCE, MOTIVO, TEXTOS } from '../../constants/textos';
import { Motivo } from '../../interfaces/conversacion';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { miles, soloDigitos } from '../../utils/formato';
import { etapa1Completa, habilitada, soloLectura } from '../../utils/validaciones';
import { JourneyUiStore } from '../journey-ui.store';

const MOTIVOS: readonly Motivo[] = ['liquidez', 'vivienda', 'objetivo', 'rendimientos', 'otro'];

/**
 * Etapa 1 · Entender: cuánto y por qué.
 * Ya no se pregunta «¿Para cuándo?»: el estado conserva el «este mes» por defecto que pone el store al elegir motivo o monto.
 */
@Component({
  selector: 'nc-etapa-entender',
  imports: [Icono],
  templateUrl: './etapa-entender.html',
  styleUrl: './etapa-entender.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtapaEntender {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  protected readonly motivos = MOTIVOS;
  protected readonly nombreMotivo = MOTIVO;
  protected readonly textos = TEXTOS;

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));

  /** Texto del monto mientras se escribe (con miles); fuera de foco muestra el guardado. */
  private readonly borrador = signal<string | null>(null);
  protected readonly montoTxt = computed(() => this.borrador() ?? miles(this.st().monto));

  /** Los chips de motivo quedan siempre visibles mientras la conversación es editable: se elige y se sigue. */
  protected readonly motivoAbierto = computed(() => !this.ro());
  protected readonly textoFuera = computed(() => {
    const m = this.st().motivo;
    // «Otro» continúa; «Rendimientos o expectativas» termina la experiencia (aún no hay esa funcionalidad)
    return m === 'rendimientos' ? FUERA_DE_ALCANCE.rendimientos : null;
  });
  /** El resumen «Motivo: …» solo se ve en solo lectura; en edición quedan los chips. */
  protected readonly motivoHecho = computed(() => {
    const st = this.st();
    if (!st.motivo || !this.ro()) return null;
    return st.motivo === 'otro' && st.otro.trim() ? 'Otro: ' + st.otro.trim() : MOTIVO[st.motivo];
  });
  protected readonly verVivienda = computed(() => this.st().motivo === 'vivienda' && etapa1Completa(this.st()));
  /** El botón de continuar siempre está; se activa cuando la etapa está completa (o en solo lectura). */
  protected readonly puedeContinuar = computed(() => etapa1Completa(this.st()) || this.ro());

  private readonly inputMonto = viewChild.required<ElementRef<HTMLInputElement>>('monto');
  private focoAtendido = this.ui.focoMonto();

  constructor() {
    afterRenderEffect(() => {
      const pedido = this.ui.focoMonto();
      if (pedido === this.focoAtendido) return;
      this.focoAtendido = pedido;
      const el = this.inputMonto().nativeElement;
      el.focus();
      el.select();
    });
    // Al cerrar el journey con el monto en edición, se guarda (como `cerrar()` del prototipo)
    inject(DestroyRef).onDestroy(() => {
      if (this.borrador() !== null) this.guardarMonto();
    });
  }

  protected escribirMonto(e: Event): void {
    const input = e.target as HTMLInputElement;
    const txt = miles(soloDigitos(input.value));
    input.value = txt;
    this.borrador.set(txt);
  }

  protected guardarMonto(): void {
    const txt = this.borrador();
    if (txt === null) return;
    this.borrador.set(null);
    this.store.definirMonto(soloDigitos(txt));
  }

  protected teclaMonto(e: Event): void {
    e.preventDefault();
    this.guardarMonto();
  }

  protected elegirMotivo(m: Motivo): void {
    this.store.elegirMotivo(m);
  }

  protected anotarFuera(e: Event): void {
    this.store.anotarMotivoFuera((e.target as HTMLTextAreaElement).value);
  }

  protected volverAEditar(): void {
    this.store.reabrirFueraDeAlcance();
  }

  protected salir(): void {
    this.ui.pedirSalir();
  }

  protected cerrarFuera(): void {
    this.store.cerrarFueraDeAlcance();
    this.ui.toast('info', ...TEXTOS.toastFuera);
  }

  protected continuar(): void {
    if (habilitada(this.st(), 2)) this.store.irEtapa(2);
  }
}
