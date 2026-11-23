import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { esMensajeTelefono, HASH_MOVIL, PARAM_EMBED } from '@core/vista-previa/vista-previa';

type Vista = 'escritorio' | 'movil';

/**
 * Control del prototipo «Escritorio / Móvil» (no es parte de Contigo): en «Móvil» muestra la misma
 * página dentro de un teléfono de 375px (iframe con `?embed=1`). La URL de afuera sigue a la del
 * teléfono con `#movil`, así el enlace se puede copiar y abre directo en móvil.
 */
@Component({
  selector: 'nc-vista-previa',
  templateUrl: './vista-previa.html',
  styleUrl: './vista-previa.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:message)': 'recibir($event)' },
})
export class VistaPrevia {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly doc = inject(DOCUMENT);

  protected readonly vista = signal<Vista>(this.doc.location.hash === `#${HASH_MOVIL}` ? 'movil' : 'escritorio');
  /** El teléfono se carga la primera vez que se abre «Móvil». */
  protected readonly src = signal<SafeResourceUrl | null>(null);

  private readonly escritorioBtn = viewChild.required<ElementRef<HTMLButtonElement>>('escritorio');
  private readonly movilBtn = viewChild.required<ElementRef<HTMLButtonElement>>('movil');
  private readonly telefono = viewChild<ElementRef<HTMLIFrameElement>>('telefono');

  constructor() {
    if (this.vista() === 'movil') this.cargarTelefono();
    // La página de atrás no hace scroll mientras se ve el teléfono.
    effect(() => {
      const movil = this.vista() === 'movil';
      this.doc.documentElement.style.overflow = movil ? 'hidden' : '';
      this.doc.documentElement.classList.toggle('pv-on', movil);
    });
  }

  protected ver(vista: Vista): void {
    if (vista === 'movil') {
      // Como en el prototipo: si ya estaba cargado, se recarga para mostrar el estado actual.
      if (this.src()) this.telefono()?.nativeElement.contentWindow?.location.reload();
      else this.cargarTelefono();
      this.location.replaceState(`${this.rutaApp()}#${HASH_MOVIL}`);
    } else {
      // De vuelta en escritorio, la barra muestra otra vez la página de atrás.
      this.location.replaceState(this.rutaApp());
    }
    this.vista.set(vista);
  }

  protected teclado(e: KeyboardEvent): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const otra: Vista = this.vista() === 'escritorio' ? 'movil' : 'escritorio';
    this.ver(otra);
    (otra === 'movil' ? this.movilBtn() : this.escritorioBtn()).nativeElement.focus();
  }

  /** El teléfono avisa qué página muestra: la URL de afuera la refleja con `#movil`. */
  protected recibir(e: MessageEvent): void {
    if (this.vista() !== 'movil' || e.origin !== this.doc.location.origin) return;
    if (e.source !== this.telefono()?.nativeElement.contentWindow || !esMensajeTelefono(e.data)) return;
    this.location.replaceState(`${e.data.url}#${HASH_MOVIL}`);
  }

  /** Ruta que muestra la app de atrás, sin el fragmento `#movil`. */
  private rutaApp(): string {
    return this.router.url.split('#')[0];
  }

  private cargarTelefono(): void {
    // Se toma de la barra de direcciones: con un enlace directo `…#movil` el router aún no ha navegado.
    const { pathname, search } = this.doc.location;
    const url = `${pathname}${search}`;
    const conEmbed = `${url}${url.includes('?') ? '&' : '?'}${PARAM_EMBED}=1`;
    // URL interna de la misma app: es seguro marcarla como recurso confiable.
    this.src.set(this.sanitizer.bypassSecurityTrustResourceUrl(conEmbed));
  }
}
