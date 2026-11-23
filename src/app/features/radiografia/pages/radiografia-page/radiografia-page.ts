import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { RUTAS } from '@core/constants/rutas';
import { MQ_MOBILE } from '@core/constants/breakpoints';
import { injectMediaQuery } from '@core/utils/media-query';
import { ChartTipView } from '@features/radiografia/components/comunes/chart-tip/chart-tip';
import { ChartTipState } from '@features/radiografia/components/comunes/chart-tip/chart-tip.state';
import { Encabezado } from '@features/radiografia/components/comunes/encabezado/encabezado';
import { Identidad } from '@features/radiografia/components/comunes/identidad/identidad';
import { Migas } from '@features/radiografia/components/comunes/migas/migas';
import { Pestanas } from '@features/radiografia/components/comunes/pestanas/pestanas';
import { TarjetasPosicion } from '@features/radiografia/components/comunes/tarjetas-posicion/tarjetas-posicion';
import { PanelRadiografia } from '@features/radiografia/components/panel-radiografia/panel-radiografia';
import { InfoVista } from '@features/radiografia/components/modales/info-vista/info-vista';
import { ListaClientes } from '@features/radiografia/components/modales/lista-clientes/lista-clientes';
import { CrearRutaModal } from '@features/radiografia/components/ruta-accion/crear-ruta-modal/crear-ruta-modal';
import { DescartarMetaModal } from '@features/radiografia/components/ruta-accion/descartar-meta-modal/descartar-meta-modal';
import { EditarMetaModal } from '@features/radiografia/components/ruta-accion/editar-meta-modal/editar-meta-modal';
import { AsignarFpModal } from '@features/radiografia/components/sin-pac/asignar-fp-modal/asignar-fp-modal';
import { TARJETAS_POSICION_VISIBLES } from '@features/radiografia/constants/ajustes';
import { TAB_IDS } from '@features/radiografia/constants/pestanas';
import { nombrePestana } from '@features/radiografia/constants/textos';
import { PlanEmpresa, TabId, Vista } from '@features/radiografia/interfaces/radiografia';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';

const esTab = (t: string | undefined): t is TabId => !!t && (TAB_IDS as readonly string[]).includes(t);

/**
 * Radiografía de empresa (Empresa ABC S.A. con plan corporativo, o Empresa XYZ S.A.S. sin plan).
 * Query params: `?plan=sin`, `?rol=dueno|fp` (por defecto director) y `?tab=…` (por defecto resumen).
 * Orquesta migas, encabezado, identidad, pestañas, el panel activo, modales y el informe PDF.
 */
@Component({
  selector: 'nc-radiografia-page',
  imports: [
    Migas,
    Encabezado,
    Identidad,
    TarjetasPosicion,
    Pestanas,
    PanelRadiografia,
    InfoVista,
    ListaClientes,
    CrearRutaModal,
    EditarMetaModal,
    DescartarMetaModal,
    AsignarFpModal,
    ChartTipView,
  ],
  templateUrl: './radiografia-page.html',
  styleUrl: './radiografia-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RadiografiaStore, ChartTipState],
  host: {
    '[class.m-detalle]': 'store.mDetalle()',
    '[class.imprimiendo]': 'imprimiendo()',
    '[attr.data-view]': 'store.vista()',
    '(window:afterprint)': 'imprimiendo.set(false)',
  },
})
export class RadiografiaPage {
  /** `sin` = empresa sin Plan de Ahorro Corporativo (siempre vista director). */
  readonly plan = input<string>();
  /** `dueno` | `fp`; cualquier otro valor = director. */
  readonly rol = input<string>();
  readonly tab = input<string>();

  protected readonly store = inject(RadiografiaStore);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly movil = injectMediaQuery(MQ_MOBILE);
  private readonly pestanas = viewChild(Pestanas);

  protected readonly tarjetasPosicion = TARJETAS_POSICION_VISIBLES;
  protected readonly imprimiendo = signal(false);
  protected readonly empresa = computed(() => (this.store.sinPac() ? 'Empresa XYZ S.A.S.' : 'Empresa ABC S.A.'));
  /** Paneles en pantalla: el activo, o todos los de la vista mientras se imprime el informe. */
  protected readonly paneles = computed(() =>
    (this.imprimiendo() ? this.store.tabsVisibles() : [this.store.tab()]).map((id) => ({
      id,
      titulo: nombrePestana(id, this.store.vista(), this.store.plan()),
    })),
  );

  private scrollLista = 0;
  private primeraCarga = true;

  constructor() {
    // URL → estado (los enlaces directos y el dashboard llegan con ?plan, ?rol y ?tab)
    effect(() => {
      const plan: PlanEmpresa = this.plan() === 'sin' ? 'sin' : 'con';
      const rol = this.rol();
      const vista: Vista = rol === 'dueno' || rol === 'fp' ? rol : 'director';
      const tab = this.tab();
      untracked(() => {
        this.store.configurar(plan, vista, esTab(tab) ? tab : null);
        // Enlace directo a una pestaña en celular: entra a su detalle
        if (this.primeraCarga && esTab(tab) && this.store.tab() === tab && this.movil()) this.store.entrarDetalle();
        this.primeraCarga = false;
      });
    });
    // Estado → URL: la pestaña activa queda en ?tab (reemplaza el postMessage al marco de Nuevo Contigo)
    effect(() => {
      const activa = this.store.tab();
      const enUrl = untracked(() => this.tab()) ?? 'resumen';
      if (activa === enUrl) return;
      untracked(() =>
        this.router.navigate([], { queryParams: { tab: activa }, queryParamsHandling: 'merge', replaceUrl: true }),
      );
    });
  }

  protected seleccionarTab(id: TabId): void {
    this.store.seleccionarTab(id);
    // Celular: las pestañas son una lista de secciones; al tocar una se entra a su detalle
    if (!this.movil()) return;
    this.scrollLista = window.scrollY;
    this.store.entrarDetalle();
    window.scrollTo(0, 0);
  }

  /** Flecha del celular: dentro de una sección vuelve a la lista; desde la lista, al inicio. */
  protected volverMovil(): void {
    if (!this.store.mDetalle()) {
      this.irInicio();
      return;
    }
    this.store.volverALista();
    const y = this.scrollLista;
    afterNextRender(
      () => {
        window.scrollTo(0, y);
        this.pestanas()?.enfocarActiva();
      },
      { injector: this.injector },
    );
  }

  protected irInicio(): void {
    this.router.navigate(['/', RUTAS.inicio]);
  }

  /** Descargar informe PDF: muestra todas las pestañas de la vista y abre la impresión (Guardar como PDF). */
  protected descargarPdf(): void {
    this.imprimiendo.set(true);
    afterNextRender(() => window.print(), { injector: this.injector });
  }
}
