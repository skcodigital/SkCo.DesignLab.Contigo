import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ASESOR } from '../data/menu';
import { Bell } from '../bell/bell';
import { IaSwitch } from '../ia-switch/ia-switch';
import { NavStore } from '../nav.store';
import { SearchBox } from '../search-box/search-box';

/** Header sticky del portal: menú móvil, asistentes de IA, buscador, notificaciones y saludo. */
@Component({
  selector: 'nc-header',
  imports: [IaSwitch, SearchBox, Bell],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly nav = inject(NavStore);
  protected readonly asesor = ASESOR;
}
