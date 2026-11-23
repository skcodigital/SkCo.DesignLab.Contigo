import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Descarte, ETIQUETA_MOTIVO, MotivoDescarte } from '@core/state/misiones.store';
import { UiStore } from '@core/state/ui.store';

interface Opcion {
  valor: MotivoDescarte;
  etiqueta: string;
}

const OPCIONES: readonly Opcion[] = [
  { valor: MotivoDescarte.FalsaAlarma, etiqueta: ETIQUETA_MOTIVO[MotivoDescarte.FalsaAlarma] },
  { valor: MotivoDescarte.NoRelevante, etiqueta: ETIQUETA_MOTIVO[MotivoDescarte.NoRelevante] },
  { valor: MotivoDescarte.YaAcompanado, etiqueta: ETIQUETA_MOTIVO[MotivoDescarte.YaAcompanado] },
  { valor: MotivoDescarte.Otro, etiqueta: 'Otro' },
];

/**
 * Modal «¿Por qué descartas esta misión?» (Figma Portal Clientes 2.0 · 67401:3430), compartida por el
 * dashboard y la ficha. El motivo es obligatorio; con «Otro» se pide el texto.
 * En modo misión toma la variante grafito vía `:host-context(.modo-mision)`.
 */
@Component({
  selector: 'nc-descartar-mision-modal',
  templateUrl: './descartar-mision-modal.html',
  styleUrl: './descartar-mision-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'abierta() && cerrar()' },
})
export class DescartarMisionModal {
  private readonly ui = inject(UiStore);

  readonly abierta = model(false);
  /** Nombre del cliente de la misión. */
  readonly nombre = input('');
  readonly confirmar = output<Descarte>();

  protected readonly opciones = OPCIONES;
  protected readonly Otro = MotivoDescarte.Otro;
  protected readonly motivo = signal<MotivoDescarte | null>(null);
  protected readonly detalle = signal('');
  protected readonly valido = computed(() => {
    const m = this.motivo();
    return m !== null && (m !== MotivoDescarte.Otro || this.detalle().trim() !== '');
  });

  private readonly caja = viewChild<ElementRef<HTMLElement>>('caja');
  private volverA: HTMLElement | null = null;

  constructor() {
    effect(() => this.ui.set('pp-md-abierta', this.abierta()));
    // Al abrir: foco en la primera opción y se recuerda a dónde devolver el foco al cerrar.
    afterRenderEffect(() => {
      if (!this.abierta()) return;
      const caja = this.caja()?.nativeElement;
      if (!caja || caja.contains(document.activeElement)) return;
      this.volverA = document.activeElement as HTMLElement | null;
      caja.querySelector<HTMLInputElement>('input[type="radio"]')?.focus();
    });
  }

  protected leerTexto(e: Event): void {
    this.detalle.set((e.target as HTMLTextAreaElement).value);
  }

  protected enviar(): void {
    const motivo = this.motivo();
    if (!this.valido() || motivo === null) return;
    this.confirmar.emit(
      motivo === MotivoDescarte.Otro ? { motivo, detalle: this.detalle().trim() } : { motivo },
    );
    this.cerrar();
  }

  protected cerrar(): void {
    this.abierta.set(false);
    this.motivo.set(null);
    this.detalle.set('');
    const destino = this.volverA;
    this.volverA = null;
    if (destino?.isConnected) destino.focus();
  }

  protected clicVelo(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.cerrar();
  }

  /** Mantiene el foco dentro de la modal con Tab / Shift+Tab. */
  protected atraparFoco(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const caja = this.caja()?.nativeElement;
    if (!caja) return;
    const focos = [...caja.querySelectorAll<HTMLElement>('button,input,textarea')].filter(
      (x) => !(x as HTMLButtonElement).disabled && x.offsetParent !== null,
    );
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
