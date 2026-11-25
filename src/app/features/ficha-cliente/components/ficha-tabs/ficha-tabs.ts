import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { PESTANAS_FICHA } from '@features/ficha-cliente/constants/pestanas';
import { PestanaFichaId } from '@features/ficha-cliente/interfaces/pestanas';
import { NovedadesStore } from '@features/ficha-cliente/state/novedades.store';

interface PosicionGlobo {
  readonly left: number;
  readonly top: number;
  /** Posición horizontal de la flecha del globo. */
  readonly flecha: number;
}

/**
 * Pestañas de la ficha (en móvil se ven como filas que abren cada sección como pantalla aparte) y el globo
 * de novedad «Ahora en Contigo» sobre Planeación Pro.
 */
@Component({
  selector: 'nc-ficha-tabs',
  templateUrl: './ficha-tabs.html',
  styleUrl: './ficha-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'ubicarGlobo()' },
})
export class FichaTabs {
  readonly activa = input.required<PestanaFichaId>();
  readonly elegir = output<PestanaFichaId>();

  protected readonly pestanas = PESTANAS_FICHA;
  protected readonly novedades = inject(NovedadesStore);
  /** El globo (y el tag «Nuevo» en móvil) se ve hasta que el asesor lo cierra con la X, también dentro de Planeación Pro. */
  protected readonly novedad = computed(() => this.novedades.planeacionPro());
  protected readonly posicion = signal<PosicionGlobo | null>(null);

  private readonly envoltura = viewChild.required<ElementRef<HTMLElement>>('envoltura');
  private readonly globo = viewChild<ElementRef<HTMLElement>>('globo');
  private readonly tabs = viewChildren<ElementRef<HTMLElement>>('tab');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observador = new ResizeObserver(() => this.ubicarGlobo());
      observador.observe(this.envoltura().nativeElement);
      destroyRef.onDestroy(() => observador.disconnect());
      this.ubicarGlobo();
    });
  }

  protected alTeclado(e: KeyboardEvent, id: PestanaFichaId): void {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this.elegir.emit(id);
  }

  /** Lleva a Planeación Pro; el globo solo se apaga con la X. */
  protected irANovedad(): void {
    this.elegir.emit('copiloto');
  }

  /** Globo sobre la pestaña Planeación Pro, con la flecha en su centro. */
  protected ubicarGlobo(): void {
    const g = this.globo()?.nativeElement;
    const i = this.pestanas.findIndex((p) => p.id === 'copiloto');
    const tab = this.tabs()[i]?.nativeElement;
    if (!g || !tab) return;
    const r = tab.getBoundingClientRect();
    const rw = this.envoltura().nativeElement.getBoundingClientRect();
    const gw = g.offsetWidth;
    let left = r.left - rw.left + r.width / 2 - gw / 2;
    left = Math.max(0, Math.min(left, rw.width - gw));
    const x = r.left - rw.left + r.width / 2 - left;
    this.posicion.set({ left, top: r.top - rw.top - g.offsetHeight - 8, flecha: Math.max(14, Math.min(x, gw - 14)) });
  }
}
