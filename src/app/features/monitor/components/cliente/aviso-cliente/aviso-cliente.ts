import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';

/**
 * Aviso informativo de la página del Monitor del cliente (`ngb-alert` de tipo `info` con borde celeste): el de
 * los productos MFUND y FICS y el de la TIR en cero. El texto se proyecta.
 */
@Component({
  selector: 'nc-mon-aviso-cliente',
  imports: [Icono],
  template: `
    <div class="aviso" role="alert">
      <span class="icono"><nc-mon-icono nombre="circulo-exclamacion" /></span>
      <div class="texto"><ng-content /></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    // ngb-alert.alert.p-2.d-flex.gap-2 con fondo #ebf4ffeb y borde #5cd5ff
    .aviso {
      display: flex;
      gap: 8px;
      padding: 8px;
      margin-bottom: 16px;
      border: 1px solid #5cd5ff;
      border-radius: 0.375rem;
      background-color: #ebf4ffeb;
    }

    // icon-circle-exclamation-line p-1 mt-2 (22px, celeste)
    .icono {
      display: inline-flex;
      padding: 4px;
      margin-top: 8px;
      font-size: 22px;
      color: #5cd5ff;
      height: max-content;
    }

    .texto {
      color: var(--sk-color-text);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoCliente {}
