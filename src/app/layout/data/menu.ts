import { RUTAS } from '@core/constants/rutas';

/** Secciones del submenú lateral (drawer en escritorio, acordeón en móvil). */
export type SeccionMenu = 'f-afil' | 'f-com' | 'f-ope';

/** Enlaces del submenú que ya tienen vista en el laboratorio; los demás no navegan. */
export const RUTAS_MENU: Readonly<Partial<Record<string, string>>> = {
  Monitor: `/${RUTAS.monitor}`,
};

export interface SubmenuMenu {
  id: SeccionMenu;
  titulo: string;
  enlaces: readonly string[];
}

export const SUBMENUS: Readonly<Record<SeccionMenu, SubmenuMenu>> = {
  'f-afil': {
    id: 'f-afil',
    titulo: 'Afiliaciones',
    enlaces: ['Recomendación profesional 🏆', 'Vinculaciones Digitales', 'Prospectos Multifund'],
  },
  'f-com': {
    id: 'f-com',
    titulo: 'Comercial',
    enlaces: [
      'Comisiones Skandia Vida',
      'Herramientas',
      'One seguros',
      'Comisiones',
      'Simuladores',
      'Contenidos',
      'Carrera de los mejores',
      'Portafolios admisibles Sk Créditos',
      'Comisiones 💫',
    ],
  },
  'f-ope': { id: 'f-ope', titulo: 'Operativo', enlaces: ['Herramientas', 'Monitor', 'Tutoriales'] },
};

export const SECCIONES_MENU: readonly SeccionMenu[] = ['f-afil', 'f-com', 'f-ope'];

/** Pie del menú (datos de ejemplo). */
export const PIE_MENU = {
  ultimoLogin: 'Último login: 03/11/2026 - 10:09:02 AM',
  ip: 'Dirección IP: 98.98.26.115',
  copy: '2026 SKANDIA',
} as const;

export const ASESOR = { nombre: 'Juan', avatar: 'assets/avatar-asesor.jpg', notificaciones: 4 } as const;
