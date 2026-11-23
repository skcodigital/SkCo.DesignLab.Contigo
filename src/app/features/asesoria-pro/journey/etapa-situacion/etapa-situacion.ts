import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icono } from '../../components/icono/icono';
import { TEXTOS } from '../../constants/textos';
import { CONTRATOS, TRAMOS } from '../../data/contratos.mock';
import { TipoTramo } from '../../interfaces/contrato';
import { SiNo } from '../../interfaces/conversacion';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { esp, ordenFichas } from '../../utils/calculos';
import { pesos } from '../../utils/formato';
import { etapa1Completa, etapa2Completa, habilitada, soloLectura } from '../../utils/validaciones';
import { JourneyUiStore } from '../journey-ui.store';

interface TramoFicha {
  tipo: TipoTramo;
  nombre: string;
  descripcion: string;
  valor: string;
  ancho: string;
}

/** Etapa 2 · Situación: requisitos de pensión y fichas de contrato (del que conviene sacarlo). */
@Component({
  selector: 'nc-etapa-situacion',
  imports: [Icono],
  templateUrl: './etapa-situacion.html',
  styleUrl: './etapa-situacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtapaSituacion {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly ver = computed(() => etapa1Completa(this.st()) || this.ro());

  protected readonly verPension = computed(() => {
    const st = this.st();
    return this.ver() && st.motivo !== 'vivienda' && (CONTRATOS.some((c) => c.cc > 0) || !!st.pen);
  });
  protected readonly notaPension = computed(() => {
    const pen = this.st().pen;
    return pen === 'si' ? TEXTOS.penSi : !pen ? TEXTOS.penSinMarca : '';
  });

  protected readonly fichas = computed(() => {
    if (!this.ver()) return [];
    const st = this.st();
    const orden = ordenFichas(st);
    const varias = orden.length > 1;
    const e = esp(st);
    const marcado = st.ctMarc || st.ctConf || orden[0].c.id;
    return orden.map((f, ix) => {
      const c = f.c;
      const k = f.k;
      const base: [TipoTramo, number][] = e
        ? [['ex', c.ex + c.sr + c.cc], ['sc', c.sc]]
        : TRAMOS.map((t) => [t.tipo, c[t.tipo]] as [TipoTramo, number]);
      const valores = base.filter((t) => t[1] > 0);
      const tot = valores.reduce((a, t) => a + t[1], 0);
      const tramos: TramoFicha[] = valores.map(([tipo, v]) => {
        const def = TRAMOS.find((t) => t.tipo === tipo) ?? TRAMOS[0];
        return {
          tipo, nombre: def.nombre, descripcion: def.descripcion, valor: pesos(v),
          ancho: Math.max(2, (v / tot) * 100).toFixed(2) + '%',
        };
      });
      return {
        c, varias, tramos, cubre: k.cubre, marcado: c.id === marcado,
        menor: varias && ix === 0 && k.cubre,
        recibe: pesos(k.R), descuenta: pesos(k.D), retenciones: pesos(k.D - k.R),
        disp: pesos(c.disp),
      };
    });
  });
  protected readonly ninguno = computed(() =>
    this.ver() && !ordenFichas(this.st()).some((f) => f.k.cubre) ? TEXTOS.ningunoCubre(pesos(this.st().monto)) : null,
  );
  protected readonly verContinuar = computed(() => etapa2Completa(this.st()) || this.ro());

  protected elegirPension(v: SiNo): void {
    this.store.elegirPension(v);
  }

  protected marcar(id: string): void {
    this.store.marcarContrato(id);
  }

  protected verDetalle(e: Event, id: string): void {
    e.preventDefault();
    this.ui.abrirDetalle(id, 'contrato');
  }

  protected confirmar(): void {
    this.store.confirmarContrato();
  }

  protected continuar(): void {
    if (habilitada(this.st(), 3)) this.store.irEtapa(3);
  }
}
