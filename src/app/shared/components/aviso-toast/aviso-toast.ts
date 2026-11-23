import { ChangeDetectionStrategy, Component, computed, inject, signal, effect } from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';

/** Toast global (`AvisoStore.mostrar`). Se monta una sola vez en el shell. */
@Component({
  selector: 'nc-aviso-toast',
  template: `
    <div class="pp-toast" [class.on]="visible()" role="status" aria-live="polite">
      <span>{{ texto() }}</span>
      @if (conDeshacer()) {
        <button type="button" (click)="avisos.deshacer()">Deshacer</button>
      }
    </div>
  `,
  styleUrl: './aviso-toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoToast {
  protected readonly avisos = inject(AvisoStore);
  protected readonly visible = computed(() => this.avisos.actual() !== null);
  // El texto se conserva mientras el toast se desvanece (como en el prototipo).
  private readonly _texto = signal('');
  protected readonly texto = this._texto.asReadonly();
  private readonly _conDeshacer = signal(false);
  protected readonly conDeshacer = this._conDeshacer.asReadonly();

  constructor() {
    effect(() => {
      const a = this.avisos.actual();
      if (!a) return;
      this._texto.set(a.texto);
      this._conDeshacer.set(!!a.deshacer);
    });
  }
}
