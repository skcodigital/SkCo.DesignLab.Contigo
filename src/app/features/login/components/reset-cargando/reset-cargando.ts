import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Pantalla de carga simulada del restablecimiento: isotipo «latiendo» + mensaje. */
@Component({
  selector: 'nc-reset-cargando',
  template: `
    <div class="rs-cargando" role="status" aria-live="polite">
      <svg class="rs-iso" viewBox="-12 -10 64 64" aria-hidden="true">
        <g class="rs-iso-fig">
          <path d="M1.21062 15.8641L31.3276 45.8323C31.7828 46.2844 32.3624 46.5921 32.9933 46.7166C33.6242 46.8411 34.2779 46.7767 34.8721 46.5317C35.4662 46.2866 35.974 45.8719 36.3313 45.3398C36.6887 44.8077 36.8796 44.1822 36.8798 43.5422V15.0855C36.8791 13.827 36.3763 12.6202 35.482 11.7303C34.5876 10.8404 33.3749 10.3401 32.1101 10.3394H3.51204C2.8689 10.3396 2.24027 10.5295 1.70555 10.8851C1.17083 11.2407 0.754015 11.746 0.507748 12.3372C0.261481 12.9284 0.196813 13.5789 0.321913 14.2067C0.447013 14.8344 0.756269 15.4112 1.21062 15.8641Z" fill="#00C73D" />
          <path d="M2.04213 45.1511C6.40045 49.4908 13.8571 46.4193 13.8571 40.2848C13.8571 38.4582 13.1278 36.7063 11.8298 35.4147C10.5318 34.1231 8.77124 33.3975 6.93553 33.3975C0.767714 33.3975 -2.31907 40.8172 2.04501 45.154" fill="#00C73D" />
          <text x="28" y="22" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="600" font-size="8" fill="#fff">sk</text>
        </g>
        <circle class="rs-pt" cx="20" cy="-5" r="1.4" />
        <circle class="rs-pt" cx="45" cy="22" r="1.4" />
        <circle class="rs-pt" cx="22" cy="51" r="1.4" />
        <circle class="rs-pt" cx="-6" cy="22" r="1.4" />
        <circle class="rs-pt" cx="13" cy="22" r="1.1" />
        <circle class="rs-pt" cx="27" cy="31" r="1.1" />
      </svg>
      <p>{{ mensaje() }}</p>
    </div>
  `,
  styleUrl: './reset-cargando.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetCargando {
  readonly mensaje = input.required<string>();
}
