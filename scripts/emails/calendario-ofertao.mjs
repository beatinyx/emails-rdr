// Calendário do Ofertão, semanas 1 a 3 (12 a 30/10): e-mails por semana e nível, com a redação
// do planejamento em scripts/data/calendario-ofertao.json (extraída do site do calendário).
// Pastas: "semana S-nN" com uma versão por empreendimento. A semana 4 (Black November) fica
// em black-semana-4.mjs.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT, EMPREENDIMENTOS, OFERTAO,
  p, caixaApoio, caixaServico, blocoBanner, blocoTraco, documento, gravar,
  CSS_CAIXA_EVENTO, NOME,
} from '../lib/base.mjs';

const FONTE = 'scripts/emails/calendario-ofertao.mjs';
const DADOS = JSON.parse(readFileSync(join(ROOT, 'scripts', 'data', 'calendario-ofertao.json'), 'utf8'));
const NIVEIS = Object.fromEntries(DADOS.niveis.map((n) => [n.id, n]));
const PRODUTO = { novo: EMPREENDIMENTOS.enredo, soul: EMPREENDIMENTOS.soul, sun: EMPREENDIMENTOS.sunin };

// ---- Campos do planejamento ([Nome], [Link ...]) → merge tags ----
const tag = (nome) => nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, '_');
const TAGS = [
  [/\[Nome\]/g, NOME],
  [/\[Link de simulação do (.+?)\]/g, (_, n) => `{{LINK_SIMULACAO_${tag(n)}}}`],
  [/\[Link para conhecer o (.+?)\]/g, (_, n) => `{{LINK_${tag(n)}}}`],
  [/\[Link de agendamento do (.+?) no Ofertão\]/g, (_, n) => `{{LINK_AGENDAMENTO_${tag(n)}}}`],
  [/\[Link de agendamento\]/g, '{{LINK_AGENDAMENTO}}'],
  [/\[Link do local do Ofertão\]/g, '{{LINK_LOCAL_OFERTAO}}'],
  [/\[Local do Ofertão\]/g, OFERTAO.local],
  [/\[Horário do evento\]/g, OFERTAO.horarios],
  [/\[Data agendada\]/g, '{{DATA_AGENDADA}}'],
  [/\[Horário agendado\]/g, '{{HORARIO_AGENDADO}}'],
  [/\[Preço da unidade Novo Enredo\]/g, '{{PRECO_NOVO_ENREDO}}'],
  [/\[Tipologia e metragem da referência\]/g, '{{UNIDADE_REFERENCIA}}'],
  [/\[Preço da unidade de referência\]/g, '{{PRECO_REFERENCIA}}'],
];
function t(txt) {
  const out = TAGS.reduce((s, [re, sub]) => s.replace(re, sub), txt);
  if (/\[[^\]]*\]/.test(out)) throw new Error(`Campo sem merge tag: ${out}`);
  return out;
}
const CONDICOES = '* {{CONDICOES_COMERCIAIS}}';

// ---- Blocos ----

// Box comercial na cor de apoio do KV: título em versalete + linhas.
function boxProduto(e, box) {
  const linhas = t(box.text).split('\n').join('<br />');
  return caixaApoio(
    e.caixa,
    `<strong style="display:block; margin:0 0 6px 0; font-size:14px; line-height:20px; letter-spacing:1.2px;">${box.title}</strong>${linhas}`,
    { comentario: `Box: ${box.title}` },
  );
}

// "Reserve a data" (semana 3): data do Ofertão em destaque e o convite abaixo.
function boxReserve(box) {
  const [evento, ...resto] = box.text.split('. ');
  const [nome, datas] = evento.split(' · ');
  return caixaServico('Reserve a data', [['icone-calendario.png', nome, datas]], { fim: resto.join('. '), margem: '4px 0 28px 0' });
}

// Foto real da obra: entra só quando validada (direção de arte); fica o lugar marcado.
const fotoObra = (foto) => `
              <!-- FOTO DA OBRA (inserir só quando atual e validada): ${foto.description} Legenda: "${foto.caption}". Sem foto aprovada, manter como está. -->`;

const bannerFachada = (e) => blocoBanner({ src: e.banner, alt: e.alt }) + blocoTraco([[e.acento, 600]]);

const larguraVml = (txt) => Math.max(300, txt.length * 10 + 90);

// ---- Documento ----

const DIA_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const dataLonga = (iso) => `${DIA_SEMANA[new Date(`${iso}T12:00:00`).getDay()]}, ${iso.slice(8)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const codigo = (x) => `S${x.semana}_${x.nivel}_${tag(x.produto)}_EMAIL_${x.data.slice(8)}${x.data.slice(5, 7)}`;

// c: copy, x: o envio, e: o empreendimento; versao: rótulo do cabeçalho.
function montar({ x, c, e, versao, banner, corpo, cta, legais, cssMobile = CSS_CAIXA_EVENTO, notas = [] }) {
  const titulo = t(c.headline);
  const html = documento({
    email: `Calendário do Ofertão · ${versao}`,
    fonte: FONTE,
    variaveis: ['@@VARIAVEIS@@'],
    titulo,
    compacto: titulo.length > 34,
    apoio: c.support ? t(c.support) : '',
    assunto: t(c.subject),
    preheader: t(c.preheader),
    cabecalho: [
      `       Versão:      ${versao}`,
      `       Disparo:     ${dataLonga(x.data)}`,
      `       Código:      ${codigo(x)}`,
      `       Assunto:     ${t(c.subject)}`,
      ...notas.map((n, i) => `       ${i ? '        ' : 'Validar:'}     ${n}`),
    ].join('\n'),
    banner,
    saudacao: t(c.body[0]),
    corpo,
    botao: { texto: cta, link: e.whatsapp, larguraVml: larguraVml(cta) },
    legais,
    cssMobile,
  });
  const vars = [...new Set(html.match(/\{\{[A-Z_]+\}\}|\*\|+[A-Z_]+\|+\*/g))];
  return html.replace('@@VARIAVEIS@@', vars.join(' · '));
}

// Semanas 1 a 3: um e-mail por empreendimento.
function emailSemana(x) {
  const c = x.copy;
  const e = PRODUTO[x.chave];
  const [, intro, produto, convite] = c.body.map(t);
  const corpo =
    p(intro) +
    p(produto, ' margin-bottom:24px;') +
    (c.photo ? fotoObra(c.photo) : '') +
    boxProduto(e, c.box) +
    (c.extraBoxes ?? []).map((b) => boxProduto(e, b)).join('') +
    '\n              ' +
    p(convite, c.eventBox ? ' margin-bottom:24px;' : ' margin-bottom:12px;') +
    (c.eventBox ? boxReserve(c.eventBox) : '');
  return montar({
    e,
    x, c,
    versao: `Semana ${x.semana} · ${x.nivel} (${NIVEIS[x.nivel].nome}) · ${e.nome}`,
    banner: bannerFachada(e),
    corpo,
    cta: x.cta,
    legais: [...(c.legal ? [CONDICOES] : []), e.legal],
    notas: [c.validation],
  });
}

// ---- Gravação ----

const ORDEM = ['novo', 'soul', 'sun'];
const pastas = new Map();
const emails = [...DADOS.emails].sort((a, b) =>
  a.semana - b.semana || a.nivel.localeCompare(b.nivel) || ORDEM.indexOf(a.chave) - ORDEM.indexOf(b.chave));
for (const x of emails) {
  const pasta = `semana ${x.semana}-${x.nivel.toLowerCase()}`;
  if (!pastas.has(pasta)) pastas.set(pasta, { titulo: `Semana ${x.semana} · ${x.nivel} · ${NIVEIS[x.nivel].nome}`, versoes: [] });
  const e = PRODUTO[x.chave];
  pastas.get(pasta).versoes.push({ arquivo: `${e.slug}.html`, rotulo: e.nome, html: emailSemana(x) });
}

for (const [pasta, { titulo, versoes }] of pastas) gravar(pasta, titulo, versoes);
