import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { TEXTOS_LOGIN } from '../../constants/textos';

export type TipoCampo = 'email' | 'password' | 'text';

/**
 * Campo con etiqueta flotante (estilo Portal Clientes) + su mensaje de error debajo.
 * El host es `display: contents`: la etiqueta y el error quedan como hijos directos del contenedor flex.
 */
@Component({
  selector: 'nc-campo-flotante',
  templateUrl: './campo-flotante.html',
  styleUrl: './campo-flotante.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoFlotante {
  readonly etiqueta = input.required<string>();
  readonly tipo = input<TipoCampo>('text');
  readonly autocomplete = input<string | null>(null);
  readonly inputmode = input<string | null>(null);
  readonly maxlength = input<number | null>(null);
  /** Botón para mostrar/ocultar la contraseña. */
  readonly conVer = input(false);
  readonly error = input<string | null>(null);
  /** Normaliza lo que se escribe (p. ej. solo dígitos); el campo refleja el valor normalizado. */
  readonly filtro = input<((valor: string) => string) | null>(null);
  /** Enfoca el campo al aparecer (equivale al foco de cada paso del prototipo). */
  readonly autoEnfocar = input(false);
  readonly valor = model('');

  protected readonly visible = signal(false);
  protected readonly tipoActual = computed(() => (this.visible() ? 'text' : this.tipo()));
  protected readonly etiquetaVer = computed(() =>
    this.visible() ? TEXTOS_LOGIN.ocultarClave : TEXTOS_LOGIN.mostrarClave,
  );

  private readonly campo = viewChild.required<ElementRef<HTMLInputElement>>('campo');

  constructor() {
    afterNextRender(() => {
      if (this.autoEnfocar()) this.enfocar();
    });
  }

  enfocar(): void {
    this.campo().nativeElement.focus();
  }

  protected escribir(e: Event): void {
    const el = e.target as HTMLInputElement;
    const filtro = this.filtro();
    const v = filtro ? filtro(el.value) : el.value;
    if (v !== el.value) el.value = v;
    this.valor.set(v);
  }

  protected alternarVer(): void {
    this.visible.update((v) => !v);
  }
}
