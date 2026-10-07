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

async function banner(p) {
  const logo = await logoPng(p.logo, p.logoW);
  const lm = await sharp(logo).metadata();
  const pad = 64;
  // o traço de acento do KV fica no HTML, abaixo do banner (build-emails.mjs)
  await sharp(p.foto)
    .resize(W, H, { fit: 'cover', position: p.pos })
    .composite([
      { input: scrim(p.scrim, W, H), top: 0, left: 0 },
      { input: logo, top: H - pad - lm.height, left: pad },
    ])
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(OUT(p.saida));
  console.log('ok', p.saida);
}

// Composição sem produto: três fachadas lado a lado, cada uma com a sua marca.
async function composicao() {
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
  await sharp({ create: { width: W, height: H, channels: 3, background: '#FEFDF8' } })
    .composite(layers)
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(OUT('banner-rdr-opcoes.jpg'));
  console.log('ok banner-rdr-opcoes.jpg');
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
