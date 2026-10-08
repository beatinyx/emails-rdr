// Gera as imagens dos e-mails (2x para 600px). Rode: node scripts/build-imagens.mjs
// Requer sharp (npm i sharp). Saída em img/.
import sharp from 'sharp';
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = (f) => join(ROOT, 'img', f);
const C = 'C:/codigos';

const W = 1200, H = 900;

const PRODUTOS = {
  soul: {
    foto: `${C}/soul-lp/public/assets/fachada.jpg`, pos: 'top',
    logo: `${C}/soul-lp/public/assets/soul-white.png`, logoW: 360,
    scrim: '12,74,92', saida: 'banner-soul-fonseca.jpg',
  },
  sunin: {
    foto: `${C}/sun-in/public/assets/facade.jpg`, pos: 'top',
    logo: `${C}/sun-in/public/assets/sunin-logo-white.svg`, logoW: 360,
    scrim: '42,42,41', saida: 'banner-sun-in.jpg',
  },
  enredo: {
    foto: join(ROOT, 'SQUAD-RDR ENGENHARIA-VILLA ISABEL-IMG-FACHADA-R02.jpg'), pos: 'centre',
    logo: join(ROOT, 'logo novo enredo.svg'), logoW: 380,
    scrim: '46,49,146', saida: 'banner-novo-enredo.jpg',
  },
};

const logoPng = (p, w) =>
  sharp(readFileSync(p), { density: 400 }).resize({ width: w }).png().toBuffer();

// Véu: diagonal no canto inferior esquerdo (onde fica a marca) + base.
const scrim = (rgb, w, h) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="b" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="rgb(${rgb})" stop-opacity=".88"/>
      <stop offset=".45" stop-color="rgb(${rgb})" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="d" x1="0" y1="1" x2=".9" y2=".25">
      <stop offset="0" stop-color="rgb(${rgb})" stop-opacity=".55"/>
      <stop offset=".5" stop-color="rgb(${rgb})" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#b)"/>
  <rect width="100%" height="100%" fill="url(#d)"/>
</svg>`);

const JPG = { quality: 78, mozjpeg: true, progressive: true };

// Fachada do produto com o véu e a marca do KV (sem gravar).
async function fachada(p) {
  const logo = await logoPng(p.logo, p.logoW);
  const lm = await sharp(logo).metadata();
  const pad = 64;
  // o traço de acento do KV fica no HTML, abaixo do banner (scripts/lib/base.mjs)
  return sharp(p.foto)
    .resize(W, H, { fit: 'cover', position: p.pos })
    .composite([
      { input: scrim(p.scrim, W, H), top: 0, left: 0 },
      { input: logo, top: H - pad - lm.height, left: pad },
    ])
    .png() // intermediário sem perda: o JPEG só é gerado uma vez, na saída
    .toBuffer();
}

async function banner(p) {
  await sharp(await fachada(p)).jpeg(JPG).toFile(OUT(p.saida));
  console.log('ok', p.saida);
}

// Composição sem produto: três fachadas lado a lado, cada uma com a sua marca.
async function composicao() {
  await sharp(await fachadasTres()).jpeg(JPG).toFile(OUT('banner-rdr-opcoes.jpg'));
  console.log('ok banner-rdr-opcoes.jpg');
}

async function fachadasTres() {
  const GAP = 6;
  const cols = [
    { ...PRODUTOS.soul, w: 384, x: 300 },
    { ...PRODUTOS.sunin, w: 372, x: 350 },
    { ...PRODUTOS.enredo, w: W - 384 - 372 - GAP * 2, x: 'centre' },
  ];
  const layers = [];
  let x = 0;
  for (const c of cols) {
    // x: recorte horizontal (px na foto já com altura H) para enquadrar a torre
    const base = sharp(c.foto).resize({ height: H });
    const bw = Math.round((await sharp(c.foto).metadata()).width * H / (await sharp(c.foto).metadata()).height);
    const left = c.x === 'centre' ? Math.round((bw - c.w) / 2) : c.x;
    const foto = await sharp(await base.toBuffer())
      .extract({ left, top: 0, width: c.w, height: H })
      .composite([{ input: scrim(c.scrim, c.w, H), top: 0, left: 0 }])
      .toBuffer();
    layers.push({ input: foto, top: 0, left: x });
    const logo = await logoPng(c.logo, Math.min(c.logoW, c.w - 80) * 0.72 | 0);
    const lm = await sharp(logo).metadata();
    layers.push({ input: logo, top: H - 48 - lm.height, left: x + 40 });
    x += c.w + GAP;
  }
  return sharp({ create: { width: W, height: H, channels: 3, background: '#FEFDF8' } })
    .composite(layers)
    .png()
    .toBuffer();
}

// ---- Ofertão RDR (e-mail 02) ----
// O banner cresce para cima: uma faixa (EXTRA px) segura o logo do Ofertão e o
// degradê desce só um pouco sobre a fachada, que fica quase toda à mostra.
// A faixa é branca em todas as versões: o logo foi desenhado para fundo claro.
const FAIXA_OFERTAO = '#FFFFFF';
const OFERTAO = join(ROOT, 'img', 'logo-ofertao-rdr.png');
export const OFERTAO_EXTRA = 280; // altura total: H + EXTRA (1200 × 1180 → 600 × 590 no e-mail)

const veuTopo = (w, h, faixa, fade, cor) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="${h}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${cor}" stop-opacity="1"/>
      <stop offset="${faixa / h}" stop-color="${cor}" stop-opacity="1"/>
      <stop offset="${(faixa + fade * 0.35) / h}" stop-color="${cor}" stop-opacity=".7"/>
      <stop offset="${(faixa + fade) / h}" stop-color="${cor}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#t)"/>
</svg>`);

async function ofertao(base, saida, cor, { logoW = 620, fade = 260 } = {}) {
  const HT = H + OFERTAO_EXTRA;
  const logo = await sharp(OFERTAO).trim().resize({ width: logoW }).png().toBuffer();
  const lm = await sharp(logo).metadata();
  await sharp({ create: { width: W, height: HT, channels: 3, background: cor } })
    .composite([
      { input: base, top: OFERTAO_EXTRA, left: 0 },
      { input: veuTopo(W, HT, OFERTAO_EXTRA, fade, cor), top: 0, left: 0 },
      { input: logo, top: 36, left: Math.round((W - lm.width) / 2) },
    ])
    .jpeg(JPG)
    .toFile(OUT(saida));
  console.log('ok', saida, `${W}x${HT}`);
}

// Ícone de calendário (traço Azul Céu, sem raio, como a RDR) para a caixa de datas.
async function iconeCalendario() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#48A1F8" stroke-width="3">
    <rect x="5" y="9" width="38" height="34"/>
    <path d="M5 19h38M15 4v10M33 4v10"/>
    <path d="M12 26h6v5h-6zM21 26h6v5h-6zM30 26h6v5h-6zM12 34h6v5h-6zM21 34h6v5h-6z" fill="#48A1F8" stroke="none"/>
  </svg>`;
  await sharp(Buffer.from(svg), { density: 300 }).resize({ width: 96 }).png({ compressionLevel: 9 }).toFile(OUT('icone-calendario.png'));
  console.log('ok icone-calendario.png');
}

// Ícone de localização no mesmo traço do calendário (e-mail 04).
async function iconeLocal() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#48A1F8" stroke-width="3">
    <path d="M24 44S9 28.5 9 19a15 15 0 0 1 30 0c0 9.5-15 25-15 25z" stroke-linejoin="miter"/>
    <circle cx="24" cy="19" r="5.5"/>
  </svg>`;
  await sharp(Buffer.from(svg), { density: 300 }).resize({ width: 96 }).png({ compressionLevel: 9 }).toFile(OUT('icone-local.png'));
  console.log('ok icone-local.png');
}

// ---- E-mail 05: abertura com a marca RDR e cartões dos empreendimentos ----

// Abertura: gradiente assinatura (design-system-rdr), lâminas a 14° e logo branco.
async function aberturaRdr() {
  const AW = 1200, AH = 440;
  const DS = `${C}/design-system-rdr/public/assets`;
  const fundo = await sharp(`${DS}/elementos/gradiente-rdr.webp`).resize(AW, AH, { fit: 'cover', position: 'centre' }).png().toBuffer();
  // lâminas: planos diagonais inclinados 14° (geometry.angulo), céu → transparente
  const tg = Math.tan(14 * Math.PI / 180) * AH | 0;
  const laminas = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${AW}" height="${AH}">
    <defs>
      <linearGradient id="c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#48A1F8" stop-opacity=".55"/><stop offset="1" stop-color="#48A1F8" stop-opacity="0"/></linearGradient>
      <linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2BBB" stop-opacity=".6"/><stop offset="1" stop-color="#1E2BBB" stop-opacity="0"/></linearGradient>
    </defs>
    <polygon points="${AW - 430},0 ${AW - 250},0 ${AW - 250 - tg},${AH} ${AW - 430 - tg},${AH}" fill="url(#a)"/>
    <polygon points="${AW - 220},0 ${AW},0 ${AW},${AH} ${AW - 220 - tg},${AH}" fill="url(#c)"/>
  </svg>`);
  const logo = await sharp(readFileSync(`${DS}/logo/rdr-logo-branco.svg`), { density: 600 }).resize({ width: 440 }).png().toBuffer();
  const lm = await sharp(logo).metadata();
  await sharp(fundo)
    .composite([
      { input: laminas, top: 0, left: 0 },
      { input: logo, top: Math.round((AH - lm.height) / 2), left: 80 },
    ])
    .jpeg(JPG)
    .toFile(OUT('banner-rdr-marca.jpg'));
  console.log('ok banner-rdr-marca.jpg');
}

// Cartão de empreendimento: fachada + véu + marca, 528 × 440 (264 × 220 no e-mail).
async function cartao(p) {
  const CW = 528, CH = 440;
  const logo = await logoPng(p.logo, 230);
  const lm = await sharp(logo).metadata();
  const saida = p.saida.replace('banner-', 'cartao-');
  await sharp(p.foto)
    .resize(CW, CH, { fit: 'cover', position: p.pos })
    .composite([
      { input: scrim(p.scrim, CW, CH), top: 0, left: 0 },
      { input: logo, top: CH - 32 - lm.height, left: 32 },
    ])
    .jpeg(JPG)
    .toFile(OUT(saida));
  console.log('ok', saida);
}

// ---- E-mail 09: banner do Feirão (Ofertão + "Feirão de imóveis" + assinatura RDR) ----

// Texto da marca convertido em contorno (path SVG): não depende da fonte instalada.
const FONTES = `${C}/design-system-rdr/public/assets/fonts`;
function textoEmPath(texto, arquivoFonte, tamanho, { tracking = 0 } = {}) {
  const buf = readFileSync(`${FONTES}/${arquivoFonte}`);
  const fonte = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  let x = 0;
  const partes = [];
  for (const ch of texto) {
    const g = fonte.charToGlyph(ch);
    partes.push(g.getPath(x, 0, tamanho).toPathData(2));
    x += (g.advanceWidth / fonte.unitsPerEm) * tamanho + tracking;
  }
  const bb = fonte.getPath(texto, 0, 0, tamanho).getBoundingBox();
  // um <path> por letra: alguns glifos (ex.: "Ã") não fecham o contorno, e num path único
  // a letra seguinte some no preenchimento
  const paths = (cor) => partes.map((d) => `<path d="${d}" fill="${cor}"/>`).join('');
  return { paths, largura: x - tracking, topo: bb.y1, base: bb.y2 };
}

// Ícone de relógio no mesmo traço do calendário (caixa do evento, e-mail 09).
async function iconeHorario() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#48A1F8" stroke-width="3">
    <circle cx="24" cy="24" r="19"/>
    <path d="M24 12v13h9" stroke-linecap="square"/>
  </svg>`;
  await sharp(Buffer.from(svg), { density: 300 }).resize({ width: 96 }).png({ compressionLevel: 9 }).toFile(OUT('icone-horario.png'));
  console.log('ok icone-horario.png');
}

async function bannerFeirao() {
  const FW = 1200, FH = 700; // 600 × 350 no e-mail
  // logo do Ofertão (já traz a plaquinha RDR, a assinatura da marca)
  const logo = await sharp(OFERTAO).trim().resize({ width: 720 }).png().toBuffer();
  const lm = await sharp(logo).metadata();
  // selo "FEIRÃO DE IMÓVEIS": tarja Azul RDR sem raio (rdr-selo), Srotone Medium
  const t = textoEmPath('FEIRÃO DE IMÓVEIS', 'Srotone-Medium.ttf', 52, { tracking: 4 });
  const padX = 40, selH = 92;
  const selW = Math.round(t.largura + padX * 2);
  const selX = Math.round((FW - selW) / 2), selY = 48 + lm.height + 36;
  const baseline = selY + selH / 2 + (t.base - t.topo) / 2 - t.base;
  // lâminas claras a 14° nas bordas, como no tapume do brandbook
  const tg = Math.tan(14 * Math.PI / 180) * FH | 0;
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${FW}" height="${FH}">
    <defs>
      <linearGradient id="c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#48A1F8" stop-opacity=".28"/><stop offset="1" stop-color="#48A1F8" stop-opacity="0"/></linearGradient>
      <linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2BBB" stop-opacity=".14"/><stop offset="1" stop-color="#1E2BBB" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#FFFFFF"/>
    <polygon points="0,0 ${170 + tg},0 170,${FH} 0,${FH}" fill="url(#c)"/>
    <polygon points="${FW - 150},0 ${FW},0 ${FW},${FH} ${FW - 150 - tg},${FH}" fill="url(#a)"/>
    <rect x="${selX}" y="${selY}" width="${selW}" height="${selH}" fill="#1E2BBB"/>
    <g transform="translate(${selX + padX} ${baseline.toFixed(1)})">${t.paths('#FFFFFF')}</g>
  </svg>`);
  await sharp(svg)
    .composite([{ input: logo, top: 48, left: Math.round((FW - lm.width) / 2) }])
    .jpeg(JPG)
    .toFile(OUT('banner-ofertao-feirao.jpg'));
  console.log('ok banner-ofertao-feirao.jpg');
}

// ---- E-mail 11: banner "É AMANHÃ!" + Ofertão (com a assinatura RDR) ----
async function bannerAmanha() {
  const FW = 1200, FH = 720; // 600 × 360 no e-mail
  const t = textoEmPath('É AMANHÃ!', 'Srotone-Bold.ttf', 150, { tracking: 2 });
  const topoTexto = 64;
  const baseline = topoTexto - t.topo;
  const logo = await sharp(OFERTAO).trim().resize({ width: 640 }).png().toBuffer();
  const lm = await sharp(logo).metadata();
  const logoY = Math.round(baseline + t.base + 40);
  // mesmas lâminas claras a 14° do banner do Feirão
  const tg = Math.tan(14 * Math.PI / 180) * FH | 0;
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${FW}" height="${FH}">
    <defs>
      <linearGradient id="c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#48A1F8" stop-opacity=".28"/><stop offset="1" stop-color="#48A1F8" stop-opacity="0"/></linearGradient>
      <linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2BBB" stop-opacity=".14"/><stop offset="1" stop-color="#1E2BBB" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#FFFFFF"/>
    <polygon points="0,0 ${170 + tg},0 170,${FH} 0,${FH}" fill="url(#c)"/>
    <polygon points="${FW - 150},0 ${FW},0 ${FW},${FH} ${FW - 150 - tg},${FH}" fill="url(#a)"/>
    <g transform="translate(${((FW - t.largura) / 2).toFixed(1)} ${baseline.toFixed(1)})">${t.paths('#1E2BBB')}</g>
  </svg>`);
  await sharp(svg)
    .composite([{ input: logo, top: logoY, left: Math.round((FW - lm.width) / 2) }])
    .jpeg(JPG)
    .toFile(OUT('banner-ofertao-amanha.jpg'));
  console.log('ok banner-ofertao-amanha.jpg', `logo termina em ${logoY + lm.height}px de ${FH}`);
}

async function logosRdr() {
  const DS = `${C}/design-system-rdr/public/assets/logo`;
  for (const [src, out] of [['rdr-logo-branco.svg', 'rdr-logo-branco.png'], ['rdr-logo-profundo.svg', 'rdr-logo-profundo.png']]) {
    await sharp(readFileSync(`${DS}/${src}`), { density: 400 }).resize({ width: 280 }).png({ compressionLevel: 9 }).toFile(OUT(out));
    console.log('ok', out);
  }
}

for (const p of Object.values(PRODUTOS)) await banner(p);
await composicao();
await logosRdr();

for (const p of Object.values(PRODUTOS)) await ofertao(await fachada(p), p.saida.replace('banner-', 'banner-ofertao-'), FAIXA_OFERTAO);
await ofertao(await fachadasTres(), 'banner-ofertao-opcoes.jpg', FAIXA_OFERTAO);
await iconeCalendario();
await iconeLocal();
await aberturaRdr();
for (const p of Object.values(PRODUTOS)) await cartao(p);
await iconeHorario();
await bannerFeirao();
await bannerAmanha();
