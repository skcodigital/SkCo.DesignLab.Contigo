/**
 * Generador mínimo de hojas de Excel (.xlsx) sin dependencias.
 * Un .xlsx es un ZIP con XML (Office Open XML). Aquí se arma un ZIP sin compresión («store») con una sola hoja,
 * celdas de texto en línea (inlineStr) y números reales, más dos estilos: negrita (títulos) y miles sin decimales.
 */

export type Celda = string | number | null;

export interface OpcionesHoja {
  /** Nombre de la pestaña (máx. 31 caracteres en Excel). */
  hoja: string;
  filas: readonly (readonly Celda[])[];
  /** Filas (0-based) que van en negrita. */
  negrita?: readonly number[];
  /** Ancho de cada columna en caracteres. */
  anchos?: readonly number[];
  /** Columnas (0-based) con formato de miles «#,##0». */
  columnasMoneda?: readonly number[];
}

const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Letra de columna de Excel: 0 → A, 25 → Z, 26 → AA. */
function columna(i: number): string {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

function hojaXml(o: OpcionesHoja): string {
  const negrita = new Set(o.negrita ?? []);
  const moneda = new Set(o.columnasMoneda ?? []);
  const cols = o.anchos?.length
    ? '<cols>' + o.anchos.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols>'
    : '';
  const filas = o.filas
    .map((fila, r) => {
      const celdas = fila
        .map((v, c) => {
          if (v === null || v === '') return '';
          const ref = columna(c) + (r + 1);
          // Estilos: 0 normal · 1 negrita · 2 miles
          if (typeof v === 'number') return `<c r="${ref}" s="${moneda.has(c) ? 2 : negrita.has(r) ? 1 : 0}"><v>${v}</v></c>`;
          return `<c r="${ref}" t="inlineStr"${negrita.has(r) ? ' s="1"' : ''}><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
        })
        .join('');
      return `<row r="${r + 1}">${celdas}</row>`;
    })
    .join('');
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    cols +
    `<sheetData>${filas}</sheetData></worksheet>`
  );
}

function partes(o: OpcionesHoja): [string, string][] {
  const hoja = esc(o.hoja.slice(0, 31));
  return [
    [
      '[Content_Types].xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '</Types>',
    ],
    [
      '_rels/.rels',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>',
    ],
    [
      'xl/workbook.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        `<sheets><sheet name="${hoja}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    ],
    [
      'xl/_rels/workbook.xml.rels',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '</Relationships>',
    ],
    ['xl/worksheets/sheet1.xml', hojaXml(o)],
    [
      'xl/styles.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
        '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
        '<cellXfs count="3">' +
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
        '<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
        '</cellXfs></styleSheet>',
    ],
  ];
}

// ---- ZIP sin compresión ----
const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = TABLA_CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(archivos: [string, string][]): Uint8Array {
  const enc = new TextEncoder();
  const locales: Uint8Array[] = [];
  const centrales: Uint8Array[] = [];
  let offset = 0;
  for (const [nombre, texto] of archivos) {
    const n = enc.encode(nombre);
    const d = enc.encode(texto);
    const crc = crc32(d);
    const loc = new DataView(new ArrayBuffer(30));
    loc.setUint32(0, 0x04034b50, true);
    loc.setUint16(4, 20, true);
    loc.setUint16(6, 0x0800, true); // nombres en UTF-8
    loc.setUint16(8, 0, true); // store
    loc.setUint32(14, crc, true);
    loc.setUint32(18, d.length, true);
    loc.setUint32(22, d.length, true);
    loc.setUint16(26, n.length, true);
    const local = new Uint8Array(30 + n.length + d.length);
    local.set(new Uint8Array(loc.buffer), 0);
    local.set(n, 30);
    local.set(d, 30 + n.length);
    locales.push(local);

    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 0x0800, true);
    cen.setUint16(10, 0, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, d.length, true);
    cen.setUint32(24, d.length, true);
    cen.setUint16(28, n.length, true);
    cen.setUint32(42, offset, true);
    const central = new Uint8Array(46 + n.length);
    central.set(new Uint8Array(cen.buffer), 0);
    central.set(n, 46);
    centrales.push(central);
    offset += local.length;
  }
  const tamCentral = centrales.reduce((a, x) => a + x.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  fin.setUint16(8, archivos.length, true);
  fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamCentral, true);
  fin.setUint32(16, offset, true);
  const total = new Uint8Array(offset + tamCentral + 22);
  let p = 0;
  for (const x of [...locales, ...centrales, new Uint8Array(fin.buffer)]) {
    total.set(x, p);
    p += x.length;
  }
  return total;
}

/** Arma el .xlsx en memoria. */
export function crearXlsx(o: OpcionesHoja): Blob {
  return new Blob([zip(partes(o)) as BlobPart], { type: MIME_XLSX });
}

/** Descarga un Blob con el nombre dado. */
export function descargarBlob(blob: Blob, nombre: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}
