// Gera as imagens dos e-mails (2x para 600px). Rode: node scripts/build-imagens.mjs
// Requer sharp (npm i sharp). Saída em img/.
import sharp from 'sharp';
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
