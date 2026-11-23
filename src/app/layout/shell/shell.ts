import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { RUTAS } from '@core/constants/rutas';
import { AvisoToast } from '@shared/components/aviso-toast/aviso-toast';
import { Header } from '../header/header';
import { NavStore } from '../nav.store';
import { Sidebar } from '../sidebar/sidebar';

/** Marco de las vistas del asesor: menú lateral, header, contenido, pie y toast global. */
@Component({
  selector: 'nc-shell',
  imports: [RouterOutlet, Sidebar, Header, AvisoToast],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  providers: [NavStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly router = inject(Router);
  private readonly nav = inject(NavStore);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** La radiografía trae su propio pie (antes `body.vista-empresa footer{display:none}`). */
  protected readonly radiografia = computed(() => this.url().startsWith(`/${RUTAS.radiografia}`));

  constructor() {
    // Cualquier navegación cierra el drawer y el menú móvil.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.nav.cerrarTodo());
  }
}
