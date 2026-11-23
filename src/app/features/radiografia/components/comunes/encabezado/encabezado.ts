import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Vista } from '@features/radiografia/interfaces/radiografia';

/** Encabezado: título con la ayuda de la vista gerencial, descripción (asesor) y "Descargar informe PDF". */
@Component({
  selector: 'nc-rx-encabezado',
  template: `
    <header class="page-head page-head--acciones">
      <div class="page-head-main">
        <div class="page-title-row">
          <h1 class="page-title">Radiografía de {{ empresa() }}</h1>
          <button class="tip" aria-haspopup="dialog" aria-label="Qué ves en la vista gerencial" (click)="info.emit()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3C16.957 3 21 7.04297 21 12C21 16.9922 16.957 21 12 21C7.00781 21 3 16.9922 3 12C3 7.04297 7.00781 3 12 3ZM12 19.3125C16.0078 19.3125 19.3125 16.043 19.3125 12C19.3125 7.99219 16.0078 4.6875 12 4.6875C7.95703 4.6875 4.6875 7.99219 4.6875 12C4.6875 16.043 7.95703 19.3125 12 19.3125ZM12 14.8125C12.5977 14.8125 13.125 15.3047 13.125 15.9375C13.125 16.5703 12.5977 17.0625 12 17.0625C11.332 17.0625 10.875 16.5703 10.875 15.9375C10.875 15.3047 11.3672 14.8125 12 14.8125ZM13.1602 7.5C14.5664 7.5 15.6562 8.58984 15.6211 9.96094C15.6211 10.8047 15.1641 11.6133 14.4258 12.0703L12.8438 13.0547V13.125C12.8438 13.582 12.457 13.9688 12 13.9688C11.543 13.9688 11.1562 13.582 11.1562 13.125V12.5625C11.1562 12.2812 11.2969 12 11.5781 11.8242L13.582 10.6289C13.8281 10.4883 13.9688 10.2422 13.9688 9.96094C13.9688 9.53906 13.582 9.1875 13.125 9.1875H11.332C10.9102 9.1875 10.5938 9.53906 10.5938 9.96094C10.5938 10.418 10.207 10.8047 9.75 10.8047C9.29297 10.8047 8.90625 10.418 8.90625 9.96094C8.90625 8.58984 9.99609 7.5 11.3672 7.5H13.1602Z" fill="currentColor"/></svg></button>
        </div>
        <p class="page-desc">
          @if (vista() === 'fp') {
            <span>Tus clientes en esta empresa: qué tienen, cómo han cambiado y a quién ofrecerle el siguiente producto.</span>
          }
        </p>
      </div>
      @if (vista() !== 'fp') {
        <button type="button" class="btn-primary btn-pdf" (click)="pdf.emit()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg> Descargar informe PDF</button>
      }
    </header>
  `,
  styleUrl: './encabezado.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Encabezado {
  readonly empresa = input.required<string>();
  readonly vista = input.required<Vista>();
  readonly info = output<void>();
  readonly pdf = output<void>();
}
