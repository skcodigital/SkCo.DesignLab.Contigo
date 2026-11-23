import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Icono } from '../icono/icono';

type Categoria = 'inicio' | 'acomp';
type Filtro = 'todas' | Categoria;

interface Journey {
  nombre: string;
  cat: Categoria;
  /** Activo (clicable); los demás salen con «Próximamente». */
  retiro?: boolean;
}

/** Como en Angular: orden por momento del cliente; el journey de la misión no se repite aquí. */
const CATALOGO: readonly Journey[] = [
  { nombre: 'Primeros pasos del cliente', cat: 'inicio' },
  { nombre: 'Planeación de aportes voluntarios', cat: 'acomp' },
  { nombre: 'Revisión de portafolio y objetivos', cat: 'acomp' },
  { nombre: 'Caída relevante del portafolio', cat: 'acomp' },
  { nombre: 'Acompañamiento en el retiro', cat: 'acomp', retiro: true },
  { nombre: 'Gestión de solicitudes', cat: 'acomp' },
];

const FILTROS: readonly (readonly [Filtro, string])[] = [
  ['todas', 'Todos'],
  ['inicio', 'Primeros pasos'],
  ['acomp', 'Acompañamiento'],
];

/** «Otras conversaciones disponibles» con filtros por momento del cliente. */
@Component({
  selector: 'nc-cop-otras',
  imports: [Icono],
  templateUrl: './cop-otras.html',
  styleUrl: './cop-otras.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopOtras {
  /** Si la misión ya no está (gestionada o descartada), «Acompañamiento en el retiro» vuelve a esta lista. */
  readonly conRetiro = input(false);
  readonly abrirRetiro = output<void>();

  protected readonly filtros = FILTROS;
  protected readonly filtro = signal<Filtro>('todas');
  protected readonly lista = computed(() =>
    CATALOGO.filter((j) => (!j.retiro || this.conRetiro()) && (this.filtro() === 'todas' || j.cat === this.filtro())),
  );
}
