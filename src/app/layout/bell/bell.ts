import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Campana de notificaciones con contador. */
@Component({
  selector: 'nc-bell',
  template: `
    <button type="button" class="bell" [attr.aria-label]="etiqueta()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></svg>
      <b>{{ cantidad() }}</b>
    </button>
  `,
  styleUrl: './bell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Bell {
  readonly cantidad = input.required<number>();
  protected readonly etiqueta = computed(() => `Notificaciones, ${this.cantidad()} nuevas`);
}
