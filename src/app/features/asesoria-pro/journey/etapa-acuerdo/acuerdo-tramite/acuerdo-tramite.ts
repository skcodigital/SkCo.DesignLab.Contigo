import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, viewChildren } from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { TEXTOS, TEXTOS_OPCIONES_ACUERDO } from '../../../constants/textos';
import { etiquetaContrato, URL_ESPECIFICADO, URL_GUIA_TRANSACCIONES } from '../../../data/contratos.mock';
import { Tramite } from '../../../interfaces/conversacion';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { esRetiro, lineaCredito } from '../../../utils/acuerdo';
import { cajas, cred, tocaNoExento } from '../../../utils/calculos';
import { pesos } from '../../../utils/formato';
import { xlsxContador } from '../../../utils/texto-cliente';
import { descargarBlob } from '../../../utils/xlsx';
import { soloLectura } from '../../../utils/validaciones';

interface OpcionTramite {
  v: Tramite;
  t: string;
}

/** «¿Cómo se tramita el retiro?» / «Solicitar el crédito» y el detalle para el contador (Acuerdo). */
@Component({
  selector: 'nc-acuerdo-tramite',
  imports: [Icono],
  templateUrl: './acuerdo-tramite.html',
  styleUrl: './acuerdo-tramite.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcuerdoTramite {
  private readonly store = inject(ConversacionesStore);
  private readonly botones = viewChildren<ElementRef<HTMLButtonElement>>('tramBtn');

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly v = computed(() => cajas(this.st()));
  protected readonly ret = computed(() => esRetiro(this.st().dec));
  protected readonly esCr = computed(() => this.st().dec === 'credito');
  protected readonly viv = computed(() => this.st().motivo === 'vivienda');
  protected readonly titulo = computed(() => (this.ret() ? TEXTOS.tramRetiroT : TEXTOS.tramCreditoT));
  protected readonly aria = computed(() => (this.ret() ? TEXTOS.tramRetiroAria : TEXTOS.tramCreditoAria));
  protected readonly alerta = computed(() =>
    this.ret() && this.v().c.sc > 0 ? TEXTOS.porCertificar(pesos(this.v().c.sc)) : null,
  );
  protected readonly linea = computed(() => {
    const v = this.v();
    if (this.ret()) {
      const d = this.st().dec;
      const rec = d === 'retiro' ? v.k.R : d === 'combo' ? (v.cb?.kt ?? v.kt).R : v.kt.R;
      return TEXTOS_OPCIONES_ACUERDO.lineaRetiro(etiquetaContrato(v.c), pesos(rec));
    }
    return TEXTOS_OPCIONES_ACUERDO.lineaCredito(lineaCredito(cred(this.st())));
  });
  /** Segunda línea de la combinación: «Y solicitar crédito: …». */
  protected readonly comboLinea = computed(() => {
    const cb = this.v().cb;
    return cb ? lineaCredito(cb.cr) : '';
  });
  protected readonly opciones = computed<OpcionTramite[]>(() => {
    const t = TEXTOS_OPCIONES_ACUERDO.tramites;
    if (!this.ret()) return [{ v: 'credito', t: t.credito }];
    const ops: OpcionTramite[] = [{ v: 'portal', t: t.portal }];
    if (!this.viv()) ops.push({ v: 'especificado', t: t.especificado });
    return ops;
  });
  /** El detalle para el contador solo aplica si el retiro toca aportes no exentos. */
  protected readonly contador = computed(() => {
    const st = this.st();
    const v = this.v();
    return this.ret() && tocaNoExento(st, st.dec === 'retiro' ? v.k : v.kt);
  });
  protected readonly textos = TEXTOS;
  protected readonly urlEspecificado = URL_ESPECIFICADO;
  protected readonly urlGuia = URL_GUIA_TRANSACCIONES;

  /** Foco al primer botón de trámite (cuando falta elegirlo para registrar el cierre). */
  enfocar(): void {
    this.botones()[0]?.nativeElement.focus();
  }

  protected elegir(t: Tramite): void {
    this.store.elegirTramite(t);
  }

  protected validar(e: Event): void {
    this.store.marcarValidacion((e.target as HTMLInputElement).checked);
  }

  /** Descarga el detalle de aportes como hoja de Excel (.xlsx). */
  protected descargar(): void {
    const { nombre, blob } = xlsxContador(this.st());
    descargarBlob(blob, nombre);
  }
}
