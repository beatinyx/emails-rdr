// Semana 4 (01 a 08/11): abertura da Black November, com a redação do planejamento em
// scripts/data/black-semana-4.json (extraída do site do calendário).
// Pastas: "semana 4-nN" com uma versão por empreendimento (N0: versão geral) — um e-mail
// por lead na janela; "semana 4-ofertao" com os modelos do dia presencial, bloqueados até a
// RDR confirmar data, local e horário.
// KV: mantém os banners do Ofertão (fachada + logo), sem a tarja de data; o KV da Black
// ainda está em desenvolvimento.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT, EMPREENDIMENTOS, FONTE_TEXTO, FONTE_DISPLAY, RDR, OFERTAO, TRACO_TRES,
  p, blocoBanner, blocoTraco, documento, gravar, WHATSAPP, NOME,
} from '../lib/base.mjs';

const FONTE = 'scripts/emails/black-semana-4.mjs';
const DADOS = JSON.parse(readFileSync(join(ROOT, 'scripts', 'data', 'black-semana-4.json'), 'utf8'));
const NIVEIS = {
  N0: 'Todos os leads',
  N1: 'Crédito aprovado',
  N2: 'Já negociaram',
  N3: 'Desistiram antes',
  N4: 'Atendimento insuficiente',
  N5: 'Leads frios',
  N6: 'Sem histórico de contato',
  TODOS: 'Todos os níveis',
};
const PRODUTO = { novo: EMPREENDIMENTOS.enredo, soul: EMPREENDIMENTOS.soul, sun: EMPREENDIMENTOS.sunin };
const porNome = (nome) => Object.values(EMPREENDIMENTOS).find((e) => e.nome === nome);

// ---- Campos do planejamento ([Nome], [ MARCAÇÃO — ...]) → merge tags ----
const TAGS = [
  [/\[Nome\]/g, NOME],
  [/\[ MARCAÇÃO — DATA APROVADA\]/g, '{{DATA_OFERTAO}}'],
  [/\[ MARCAÇÃO — ESTANDE \/ ENDEREÇO\]/g, OFERTAO.local],
  [/\[ MARCAÇÃO — HORÁRIO\]/g, OFERTAO.horarios],
];
function t(txt) {
  const out = TAGS.reduce((s, [re, sub]) => s.replace(re, sub), txt);
  if (/\[[^\]]*\]/.test(out)) throw new Error(`Campo sem merge tag: ${out}`);
  return out;
}

// Botão: WhatsApp da RDR com a mensagem pronta de cada versão.
const linkWhatsapp = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg).replace(/!/g, '%21')}`;

// ---- Blocos ----

// Oferta: nome do empreendimento, desconto em destaque e a regra das unidades,
// na cor de apoio do KV do produto. maior = Novo Enredo na versão geral.
function blocoOferta({ empreendimento, destaque, apoio }, { maior = false, margem = '4px 0 0 0' } = {}) {
  const e = porNome(empreendimento);
  const c = e.caixa;
  const [tam, alt] = maior ? [34, 38] : [28, 32];
  return `
              <!-- Oferta: ${empreendimento} -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${margem};">
                <tr>
                  <td width="6" style="width:6px; background-color:${c.barra}; font-size:0; line-height:0;">&nbsp;</td>
                  <td class="rdr-caixa" style="padding:20px 28px 22px 24px; background-color:${c.fundo};">
                    <p style="margin:0 0 6px 0; font-family:${FONTE_TEXTO}; font-size:14px; line-height:20px; font-weight:bold; letter-spacing:1.2px; text-transform:uppercase; color:${c.texto};">${empreendimento}</p>
                    <p class="rdr-oferta" style="margin:0 0 6px 0; font-family:${FONTE_DISPLAY}; font-size:${tam}px; line-height:${alt}px; font-weight:bold; color:${c.barra};">${destaque}</p>
                    <p style="margin:0; font-family:${FONTE_TEXTO}; font-size:15px; line-height:22px; color:${c.texto};">${apoio}</p>
                  </td>
                </tr>
              </table>`;
}

// Chamada do botão ([cta]): logo acima do botão WHATSAPP.
const chamada = (txt) => `
              <p style="margin:28px 0 0 0; font-family:${FONTE_TEXTO}; font-size:18px; line-height:26px; font-weight:bold; color:${RDR.profundo};">${txt}</p>`;

// Pergunta do N4 ([h2]).
const pergunta = (txt) =>
  `<p style="margin:0 0 6px 0; font-family:${FONTE_TEXTO}; font-size:19px; line-height:26px; font-weight:bold; color:${RDR.profundo};">${txt}</p>`;

const banner = (e) =>
  e
    ? blocoBanner({ src: `banner-ofertao-${e.slug}.jpg`, alt: `Ofertão RDR · ${e.alt}`, altura: 590 }) + blocoTraco([[e.acento, 600]])
    : blocoBanner({ src: 'banner-ofertao-opcoes.jpg', alt: 'Ofertão RDR · Fachadas do Soul Fonseca, do Sun In e do Novo Enredo', altura: 590 }) +
      blocoTraco(TRACO_TRES);

const CSS = `
      .rdr-oferta { font-size:26px !important; line-height:30px !important; }`;

// ---- Documento ----

const codigo = (x) =>
  `S4_${x.nivel}_${x.produto ? x.produto.toUpperCase().replace(/\s+/g, '_') : 'GERAL'}_${x.tipo === 'black' ? 'BLACK_EMAIL_0111' : 'OFERTAO_EMAIL_MODELO'}`;

function email(x) {
  const e = PRODUTO[x.chave];
  const [saudacao, ...resto] = x.corpo;
  const corpo = resto
    .map((b, i) =>
      b.tipo === 'h2'
        ? pergunta(t(b.texto))
        : p(t(b.texto), resto[i + 1]?.tipo === 'h2' ? ' margin-bottom:24px;' : ''),
    )
    .join('');
  const topo =
    x.ofertas.map((o, i) => blocoOferta(o, { maior: !e && i === 0, margem: i ? '12px 0 0 0' : '4px 0 0 0' })).join('') +
    chamada(t(x.cta));
  const titulo = t(x.titulo);
  // selo e apoio iguais nas versões por produto; na geral, o apoio traz o período
  const apoio = x.selo && x.selo !== x.apoio ? `${x.selo} · ${x.apoio}` : x.apoio;
  const versao =
    x.tipo === 'black'
      ? `Semana 4 · Black November · ${x.nivel} (${NIVEIS[x.nivel]}) · ${e ? e.nome : 'versão geral'}`
      : `Semana 4 · Ofertão (dia presencial da Black) · ${e ? e.nome : 'versão geral'} · MODELO BLOQUEADO`;
  const html = documento({
    email: versao,
    fonte: FONTE,
    variaveis: ['@@VARIAVEIS@@'],
    titulo,
    compacto: titulo.length > 34,
    apoio,
    assunto: t(x.assunto),
    preheader: t(x.preheader),
    cabecalho: [
      `       Versão:      ${versao}`,
      `       Disparo:     ${x.data ? 'domingo, 01/11/2026 (referência; janela até 08/11, uma versão por lead)' : 'sem data · não programar'}`,
      `       Status:      ${x.status}`,
      `       Código:      ${codigo(x)}`,
      `       Assunto:     ${t(x.assunto)}`,
      `       Validar:     ${x.uso}`,
    ].join('\n'),
    banner: banner(e),
    topo,
    saudacao: t(saudacao.texto),
    corpo,
    botao: { texto: x.botao ?? 'WHATSAPP', link: linkWhatsapp(x.whatsapp), larguraVml: 240 },
    legais: [x.legal, ...(e ? [e.legal] : x.ofertas.map((o) => porNome(o.empreendimento).legal))],
    cssMobile: CSS,
  });
  const vars = [...new Set(html.match(/\{\{[A-Z_]+\}\}|\*\|+[A-Z_]+\|+\*/g))];
  return html.replace('@@VARIAVEIS@@', vars.join(' · '));
}

// ---- Gravação ----

const ORDEM = ['geral', 'novo', 'soul', 'sun'];
const pastas = new Map();
for (const x of [...DADOS.emails].sort((a, b) => ORDEM.indexOf(a.chave) - ORDEM.indexOf(b.chave))) {
  const e = PRODUTO[x.chave];
  const [pasta, titulo] =
    x.tipo === 'black'
      ? [`semana 4-${x.nivel.toLowerCase()}`, `Semana 4 · ${x.nivel} · ${NIVEIS[x.nivel]} · Black November (01/11)`]
      : ['semana 4-ofertao', 'Semana 4 · Ofertão, dia presencial da Black (modelos bloqueados, data a definir)'];
  if (!pastas.has(pasta)) pastas.set(pasta, { titulo, versoes: [] });
  pastas.get(pasta).versoes.push({ arquivo: `${e ? e.slug : 'geral'}.html`, rotulo: e ? e.nome : 'Versão geral', html: email(x) });
}
for (const [pasta, { titulo, versoes }] of [...pastas].sort(([a], [b]) => a.localeCompare(b))) gravar(pasta, titulo, versoes);
