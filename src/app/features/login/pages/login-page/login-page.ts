import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { RUTAS } from '@core/constants/rutas';
import { SessionStore } from '@core/state/session.store';
import { injectMediaQuery } from '@core/utils/media-query';
import { LoginCarousel } from '../../components/login-carousel/login-carousel';
import { LoginForm } from '../../components/login-form/login-form';
import { MiniBanner } from '../../components/mini-banner/mini-banner';
import { ResetPassword } from '../../components/reset-password/reset-password';
import { SamiDecor } from '../../components/sami-decor/sami-decor';
import { TIEMPOS_LOGIN } from '../../constants/textos';
import { LOGIN_SLIDES } from '../../data/login.mock';

/**
 * Login del Portal Contigo (estructura de Portal Clientes, campos de Contigo). Ruta propia, fuera del shell.
 * Orquesta: zona Skandia (entra directo), zona Independientes (formulario), restablecer contraseña,
 * banner móvil y panel derecho oscuro con Sami y el carrusel.
 */
@Component({
  selector: 'nc-login-page',
  imports: [LoginForm, MiniBanner, ResetPassword, SamiDecor, LoginCarousel],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'main', 'aria-label': 'Iniciar sesión en Portal Contigo' },
})
export class LoginPage {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly slides = LOGIN_SLIDES;
  /** ≤900px: se oculta el panel derecho y aparece el banner móvil. */
  protected readonly esMovil = injectMediaQuery('(max-width: 900px)');
  protected readonly resetAbierto = signal(false);
  /** El asesor está escribiendo en un campo: pausa el banner móvil. */
  protected readonly escribiendo = signal(false);
  protected readonly samiSalto = signal(0);
  /** Alto del fondo oscuro del banner móvil: hasta la mitad de la zona Skandia. */
  protected readonly heroH = signal<string | null>(null);

  private readonly izq = viewChild.required<ElementRef<HTMLElement>>('izq');
  private readonly zonaSk = viewChild.required<ElementRef<HTMLElement>>('zonaSk');
  private readonly loginForm = viewChild.required(LoginForm);
  private tSalto: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.tSalto));
    afterNextRender(() => {
      const medir = (): void => this.medirHero();
      medir();
      const ro = new ResizeObserver(medir);
      ro.observe(this.izq().nativeElement);
      window.addEventListener('resize', medir);
      this.destroyRef.onDestroy(() => {
        ro.disconnect();
        window.removeEventListener('resize', medir);
      });
    });
  }

  protected entrar(): void {
    this.resetAbierto.set(false);
    this.session.entrar();
    void this.router.navigate(['/', RUTAS.inicio]);
  }

  protected abrirReset(): void {
    this.resetAbierto.set(true);
  }

  protected cerrarReset(): void {
    this.resetAbierto.set(false);
    afterNextRender(
      () => {
        this.medirHero();
        this.loginForm().enfocarOlvido();
      },
      { injector: this.injector },
    );
  }

  protected alEnfocar(e: FocusEvent): void {
    if ((e.target as Element).matches('input')) this.escribiendo.set(true);
  }

  protected saltarSami(): void {
    this.samiSalto.update((n) => n + 1);
    clearTimeout(this.tSalto);
    this.tSalto = setTimeout(() => this.samiSalto.set(0), TIEMPOS_LOGIN.saltoSami);
  }

  private medirHero(): void {
    const z = this.zonaSk().nativeElement;
    this.heroH.set(`${z.offsetTop + z.offsetHeight / 2}px`);
  }
}
