// Base comum dos e-mails RDR: tokens, empreendimentos, blocos e documento.
// Cada e-mail fica em scripts/emails/NN-*.mjs e monta suas versões com estes blocos.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// imagens servidas da branch main do repositório; IMG_BASE=../img gera para revisão local
export const IMG = process.env.IMG_BASE ?? 'https://raw.githubusercontent.com/beatinyx/emails-rdr/main/img';

// ---- Tokens RDR (design-system-rdr/public/tokens/tokens.json) ----
export const RDR = {
  profundo: '#002753',
  azul: '#1E2BBB',
  ceu: '#48A1F8',
  offWhite: '#FEFDF8',
  nevoa: '#E3E6EE',
  texto: '#26344F',
  muted: '#5E6A80',
};
export const FONTE_TEXTO = "'Merta Sans', Arial, Helvetica, sans-serif";
export const FONTE_DISPLAY = "'Srotone', 'Merta Sans', Arial, Helvetica, sans-serif";

// ---- Empreendimentos: cor de apoio do KV para a caixa + texto legal ----
export const EMPREENDIMENTOS = {
  soul: {
    slug: 'soul-fonseca',
    nome: 'Soul Fonseca',
    local: 'Fonseca · Niterói',
    acento: '#4CC1F0', // traço abaixo do banner (antes ficava sobre o logo)
    banner: 'banner-soul-fonseca.jpg',
    alt: 'Fachada do Soul Fonseca, empreendimento da RDR Engenharia no Fonseca, Niterói',
    // apoio do KV Soul: lilás (#C1B4E2 → --grad-dream-soft) com o teal da marca
    caixa: { fundo: '#E4DBF3', barra: '#1B8CA6', texto: '#16232F' },
    argumento:
      'são apartamentos de 2 quartos com suíte e varanda, com lazer completo entregue equipado e decorado, a 4 minutos da Ponte Rio-Niterói.',
    // atributo: frase curta e independente para caixas de destaque (e-mail 03)
    atributo: 'Apartamentos de 2 quartos com suíte e varanda, a 4 minutos da Ponte Rio-Niterói.',
    legal:
      'Condomínio Soul Fonseca — Protocolo 91.328, R-7-27.586 do Cartório do 14º Ofício de Registro de Imóveis do 4º subdistrito do 1º distrito de Niterói - RJ.',
  },
  sunin: {
    slug: 'sun-in',
    nome: 'Sun In',
    local: 'Ingá · Niterói',
    acento: '#E3792A',
    banner: 'banner-sun-in.jpg',
    alt: 'Fachada do Sun In Studio Design, empreendimento da RDR Engenharia no Ingá, Niterói',
    // apoio do KV Sun In: creme (--sun-cream-100) com o laranja da marca
    caixa: { fundo: '#F2EEDE', barra: '#E3792A', texto: '#494948' },
    argumento:
      'são studios no Ingá, a poucos passos da UFF e do Plaza Shopping, com rooftop de lazer completo.',
    atributo: 'Studios no Ingá, a poucos passos da UFF e do Plaza Shopping, com rooftop de lazer completo.',
    legal:
      'Residencial Sun In Studio Design — Protocolo n°127306, R-23-22.569 no 2° Ofício de Justiça de Niterói / Registro de Imóveis da 1ª Circunscrição Imobiliária e Tabelião de Notas, no endereço: Rua Miguel de Frias, n°169, Loja 01, Niterói/RJ.',
  },
  enredo: {
    slug: 'novo-enredo',
    nome: 'Novo Enredo',
    local: 'Vila Isabel',
    acento: '#F3C055',
    banner: 'banner-novo-enredo.jpg',
    alt: 'Fachada do Novo Enredo Condomínio, empreendimento da RDR Engenharia em Vila Isabel',
    // apoio do KV Novo Enredo: pêssego do logo negativo com o índigo do positivo
    caixa: { fundo: '#FFEBD8', barra: '#2E3192', texto: '#2B2A4A' },
    argumento: 'são apartamentos de 2 quartos, com opção de suíte e garden, a 8 minutos do Maracanã.',
    atributo: 'Apartamentos de 2 quartos, com opção de suíte e garden, a 8 minutos do Maracanã.',
    legal:
      'Novo Enredo Condomínio — Protocolo n° 429601 - R-13 - 55.681 no 10° Ofício de Registro de Imóveis no endereço: Tv. do Paço, 23, sala 1103, Centro, Rio de Janeiro/RJ. Endereço do empreendimento: Rua Sylvio Pereira de Sá, n°71, Vila Isabel, distrito do Andaraí – Rio de Janeiro.',
  },
};

// Traço da versão sem produto: um segmento por coluna da composição de fachadas.
export const TRACO_TRES = [
  [EMPREENDIMENTOS.soul.acento, 195],
  [EMPREENDIMENTOS.sunin.acento, 188],
  [EMPREENDIMENTOS.enredo.acento, 217],
];

export const LEGAL_COMUM =
  'Imagens meramente ilustrativas. Informações sobre acabamentos, decoração e mobiliários constam no memorial descritivo. Consulte condições e unidades disponíveis.';

// ---- Blocos ---------------------------------------------------------------

export const p = (txt, extra = '') =>
  `<p style="margin:0 0 20px 0; font-family:${FONTE_TEXTO}; font-size:17px; line-height:27px; color:${RDR.texto};${extra}">${txt}</p>`;

// Traço de acento do KV logo abaixo do banner, na largura do corpo.
// Recebe [[cor, largura], ...]: um segmento por produto (a composição usa três).
export function blocoTraco(segmentos) {
  const tds = segmentos
    .map(([cor, w]) => `<td width="${w}" height="6" style="width:${w}px; height:6px; background-color:${cor}; font-size:0; line-height:0;">&nbsp;</td>`)
    .join('');
  return `
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${tds}</tr></table>
            </td>
          </tr>`;
}

// Caixa de destaque: barra lateral + fundo na cor de apoio do KV.
// c = { fundo, barra, texto }; html = conteúdo já pronto (frase ou parágrafos).
export function caixaApoio(c, html, { comentario = '', margem = '4px 0 28px 0' } = {}) {
  return `${comentario ? `
              <!-- ${comentario} -->` : ''}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${margem};">
                <tr>
                  <td width="6" style="width:6px; background-color:${c.barra}; font-size:0; line-height:0;">&nbsp;</td>
                  <td class="rdr-caixa" style="padding:24px 28px 26px 24px; background-color:${c.fundo};">
                    <p style="margin:0; font-family:${FONTE_TEXTO}; font-size:18px; line-height:28px; color:${c.texto};">${html}</p>
                  </td>
                </tr>
              </table>`;
}

export function blocoBanner({ src, alt, altura = 450 }) {
  return `
          <!-- ============ BANNER ============ -->
          <tr>
            <td style="padding:0; background-color:${RDR.profundo};">
              <img class="rdr-full" src="${IMG}/${src}" width="600" height="${altura}" alt="${alt}" style="display:block; width:600px; max-width:100%; height:auto; border:0;" />
            </td>
          </tr>`;
}

// Banner do Ofertão RDR: 1200 × 1180 (faixa branca acima da fachada) → 600 × 590.
// src = banner do e-mail 01 (banner-*.jpg); usa a versão banner-ofertao-*.jpg.
export function blocoBannerOfertao(src, alt) {
  return blocoBanner({ src: src.replace(/^banner-(rdr-)?/, 'banner-ofertao-'), alt: `Ofertão RDR · ${alt}`, altura: 590 });
}

// Legenda das três marcas: identifica cada fachada mesmo com imagens bloqueadas.
export function blocoLegendas() {
  const col = (e, w) => `
                  <td class="rdr-legenda" width="${w}" valign="top" style="width:${w}px; padding:14px 0 0 0; font-family:${FONTE_TEXTO};">
                    <span style="display:block; font-size:14px; line-height:18px; font-weight:bold; color:${RDR.profundo};">${e.nome}</span>
                    <span style="display:block; font-size:12px; line-height:16px; color:${RDR.muted};">${e.local}</span>
                  </td>`;
  const { soul, sunin, enredo } = EMPREENDIMENTOS;
  // larguras proporcionais às colunas da composição (384 / 372 / 432 de 1200)
  return `
          <!-- ============ LEGENDAS DAS FACHADAS ============ -->
          <tr>
            <td style="padding:0 0 0 0;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="rdr-full" style="width:600px;">
                <tr>${col(soul, 195).replace('padding:14px 0 0 0', 'padding:14px 8px 0 20px')}${col(sunin, 188).replace('padding:14px 0 0 0', 'padding:14px 8px 0 18px')}${col(enredo, 217).replace('padding:14px 0 0 0', 'padding:14px 8px 0 18px')}
                </tr>
              </table>
            </td>
          </tr>`;
}

export function blocoBotao({ texto, link, larguraVml = 300 }) {
  // Botão à prova de Outlook (VML) com o Azul RDR; ocupa a largura toda no celular.
  return `
          <!-- ============ BOTÃO ============ -->
          <tr>
            <td class="rdr-gutter" align="left" style="padding:8px 48px 56px 48px;">
              <!--[if mso]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${link}" style="height:60px; v-text-anchor:middle; width:${larguraVml}px;" stroke="f" fillcolor="${RDR.azul}">
                <w:anchorlock/>
                <center style="color:#FFFFFF; font-family:Arial, sans-serif; font-size:17px; font-weight:bold;">${texto} &rarr;</center>
              </v:rect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a class="rdr-btn" href="${link}" target="_blank" style="display:inline-block; background-color:${RDR.azul}; color:#FFFFFF; font-family:${FONTE_TEXTO}; font-size:17px; line-height:20px; font-weight:bold; letter-spacing:0.2px; text-decoration:none; padding:20px 36px; mso-hide:all;">${texto}&nbsp;&nbsp;&rarr;</a>
              <!--<![endif]-->
            </td>
          </tr>`;
}

export function blocoRodape(legais) {
  const linhas = legais
    .map(
      (l) =>
        `<p style="margin:0 0 10px 0; font-family:${FONTE_TEXTO}; font-size:11px; line-height:17px; color:#A9B6CB;">${l}</p>`,
    )
    .join('\n              ');
  return `
          <!-- ============ RODAPÉ ============ -->
          <!-- TODO: trocar pelo rodapé padrão de e-mail da RDR quando o texto for enviado -->
          <tr>
            <td class="rdr-gutter" style="padding:44px 48px 40px 48px; background-color:${RDR.profundo};">
              <img src="${IMG}/rdr-logo-branco.png" width="124" height="44" alt="RDR Engenharia" style="display:block; width:124px; height:auto; border:0;" />
              <p style="margin:18px 0 28px 0; font-family:${FONTE_TEXTO}; font-size:14px; line-height:21px; color:#FFFFFF;">Há mais de 30 anos transformando projetos de vida em realidade.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #2A4A73; font-size:0; line-height:0; height:1px;">&nbsp;</td></tr>
              </table>
              <div style="height:24px; line-height:24px; font-size:0;">&nbsp;</div>
              ${linhas}
              <p style="margin:0 0 10px 0; font-family:${FONTE_TEXTO}; font-size:11px; line-height:17px; color:#A9B6CB;">${LEGAL_COMUM}</p>
              <p style="margin:18px 0 0 0; font-family:${FONTE_TEXTO}; font-size:12px; line-height:18px; color:#C9D3E2;">Você recebeu este e-mail porque demonstrou interesse nos empreendimentos da RDR Engenharia. Se não quiser mais receber nossas mensagens, <a href="{{LINK_DESCADASTRO}}" target="_blank" style="color:#FFFFFF; text-decoration:underline;">descadastre-se aqui</a>.</p>
              <p style="margin:14px 0 0 0; font-family:${FONTE_TEXTO}; font-size:12px; line-height:18px; color:#C9D3E2;">RDR Engenharia · Avenida Álvares Cabral, 1777, sala 509, Santo Agostinho · Belo Horizonte - MG, Brasil</p>
            </td>
          </tr>`;
}

// ---- Documento ------------------------------------------------------------

// email:     rótulo do cabeçalho ("01 · Veja as opções")
// fonte:     script que gera o arquivo (para o aviso "editar lá")
// variaveis: merge tags usadas nesta peça
// botao:     { texto, link } — sempre logo depois do corpo
// acoes:     HTML pronto no lugar do botão único (vários botões)
// cssMobile: regras extras dentro da media query de celular
export function documento({ email, fonte, variaveis, titulo, assunto, preheader, cabecalho, banner, corpo, botao, acoes, legais, cssMobile = '' }) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${assunto}</title>

  <!-- ============================================================
       RDR Engenharia · E-mail ${email}
${cabecalho}
       Variáveis: ${variaveis.join(' · ')}
       Imagens:   servidas de ${IMG}/
       Gerado por ${fonte} (editar lá, não aqui)
       ============================================================ -->

  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->

  <style type="text/css">
    /* ---- Reset ---- */
    html, body { margin:0 !important; padding:0 !important; height:100% !important; width:100% !important; }
    * { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; border-collapse:collapse !important; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
    a { text-decoration:none; }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }

    /* ---- Mobile ---- */
    @media only screen and (max-width:620px) {
      .rdr-wrap   { width:100% !important; max-width:100% !important; }
      .rdr-full   { width:100% !important; max-width:100% !important; height:auto !important; }
      .rdr-gutter { padding-left:24px !important; padding-right:24px !important; }
      .rdr-titulo { font-size:34px !important; line-height:38px !important; }
      .rdr-caixa  { padding:20px 20px 22px 18px !important; }
      .rdr-legenda{ padding-left:12px !important; }
      /* CTA ocupa a largura toda no toque */
      .rdr-btn    { display:block !important; width:auto !important; padding-left:16px !important; padding-right:16px !important; text-align:center !important; font-size:18px !important; }${cssMobile}
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:${RDR.nevoa};">

  <!-- Pré-header: visível na inbox, oculto no corpo -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all; color:${RDR.nevoa};">
    ${preheader}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <!-- Canvas -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${RDR.nevoa};">
    <tr>
      <td align="center" style="padding:24px 0;">

        <!-- Shell 600px -->
        <table role="presentation" class="rdr-wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:${RDR.offWhite};">
${banner}

          <!-- ============ TÍTULO + CORPO ============ -->
          <tr>
            <td class="rdr-gutter" align="left" style="padding:48px 48px 8px 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="40" height="4" style="width:40px; height:4px; background-color:${RDR.ceu}; font-size:0; line-height:0;">&nbsp;</td></tr></table>
              <h1 class="rdr-titulo" style="margin:20px 0 28px 0; font-family:${FONTE_DISPLAY}; font-size:40px; line-height:44px; font-weight:300; letter-spacing:-0.4px; text-transform:uppercase; color:${RDR.azul};">${titulo}</h1>
              ${p('Olá, {{NOME}}.')}${corpo}
            </td>
          </tr>
${acoes ?? blocoBotao(botao)}
${blocoRodape(legais)}

        </table>
        <!-- /Shell -->

      </td>
    </tr>
  </table>

</body>
</html>
`;
}

// Grava as versões numa pasta e um index.html para revisão lado a lado.
export function gravar(pasta, nomeEmail, versoes) {
  const dir = join(ROOT, pasta);
  mkdirSync(dir, { recursive: true });
  for (const v of versoes) {
    writeFileSync(join(dir, v.arquivo), v.html);
    console.log('ok', `${pasta}/${v.arquivo}`);
  }
  writeFileSync(
    join(dir, 'index.html'),
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>E-mail ${nomeEmail}</title>
<style>body{margin:0;padding:24px;background:#E3E6EE;font:14px/1.4 Arial,sans-serif;color:#002753}h1{font-size:20px;margin:0 0 20px}
.grade{display:flex;flex-wrap:wrap;gap:24px}.v{background:#fff;padding:12px}.v p{margin:0 0 8px;font-weight:bold}
.v a{color:#1E2BBB}iframe{width:620px;height:1500px;border:0;display:block}</style></head><body>
<h1>E-mail ${nomeEmail} — ${versoes.length} versões</h1><div class="grade">
${versoes.map((v) => `<div class="v"><p>${v.rotulo} · <a href="${v.arquivo}" target="_blank">abrir</a></p><iframe src="${v.arquivo}" title="${v.rotulo}"></iframe></div>`).join('\n')}
</div></body></html>
`,
  );
  console.log('ok', `${pasta}/index.html`);
}
