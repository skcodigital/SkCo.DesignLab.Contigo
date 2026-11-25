import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, model, signal, untracked, viewChild } from '@angular/core';
import { UiStore } from '@core/state/ui.store';

/** Pasos de la intro de Planeación Pro. */
const PASOS = [
  {
    titulo: 'Te damos la bienvenida a Planeación Pro',
    texto: 'Acompañar a tus clientes en sus decisiones financieras: te sugerimos con quién conversar y te guiamos paso a paso durante la conversación.',
  },
  {
    titulo: 'Acompaña paso a paso',
    texto: 'Al iniciar un acompañamiento te guiamos por etapas, con los cálculos y la información listos para conversar.',
  },
  {
    titulo: 'Cierra y haz seguimiento',
    texto: 'Al finalizar, tu cliente recibe en su correo un resumen de la conversación y tú puedes agendar la reunión de seguimiento.',
  },
] as const;

/**
 * Intro de Planeación Pro: modal de 3 pasos que se muestra la primera vez que el asesor entra
 * (y cuando la pide desde «¿Qué es Planeación Pro?»). Variante grafito del modo misión.
 */
@Component({
  selector: 'nc-intro-planeacion',
  templateUrl: './intro-planeacion.html',
  styleUrl: './intro-planeacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'abierta() && cerrar()' },
})
export class IntroPlaneacion {
  readonly abierta = model(false);

  protected readonly pasos = PASOS;
  /** Etapas genéricas: cada misión tiene las suyas. */
  protected readonly etapas = [1, 2, 3] as const;
  protected readonly paso = signal(0);
  protected readonly actual = computed(() => PASOS[this.paso()]);
  protected readonly ultimo = computed(() => this.paso() === PASOS.length - 1);

  private readonly caja = viewChild<ElementRef<HTMLElement>>('caja');
  private readonly principal = viewChild<ElementRef<HTMLButtonElement>>('principal');
  private volverA: HTMLElement | null = null;

  constructor() {
    // Con la modal abierta no se desplaza la página de fondo (sobre todo en móvil)
    const ui = inject(UiStore);
    // untracked: `set` lee el estado de la UI; sin esto, choca con el efecto de la modal «Descartar» (ciclo infinito)
    effect(() => {
      const abierta = this.abierta();
      untracked(() => ui.set('pp-md-abierta', abierta));
    });
    // Al abrir: empieza en el paso 1, foco en el botón principal y se recuerda a dónde devolverlo.
    afterRenderEffect(() => {
      if (!this.abierta()) return;
      const caja = this.caja()?.nativeElement;
      if (!caja || caja.contains(document.activeElement)) return;
      this.volverA = document.activeElement as HTMLElement | null;
      this.principal()?.nativeElement.focus();
    });
  }

  protected siguiente(): void {
    if (this.ultimo()) this.cerrar();
    else this.paso.update((p) => p + 1);
  }

  protected atras(): void {
    this.paso.update((p) => Math.max(0, p - 1));
  }

  protected ir(i: number): void {
    this.paso.set(i);
  }

  protected cerrar(): void {
    this.abierta.set(false);
    this.paso.set(0);
    const destino = this.volverA;
    this.volverA = null;
    if (destino?.isConnected) destino.focus();
  }

  /** Mantiene el foco dentro de la modal con Tab / Shift+Tab. */
  protected atraparFoco(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const focos = [...(this.caja()?.nativeElement.querySelectorAll<HTMLElement>('button') ?? [])];
    const primero = focos[0];
    const ultimo = focos[focos.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo?.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero?.focus();
    }
  }
}
