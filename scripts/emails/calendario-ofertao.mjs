// Calendário do Ofertão (12/10 a 06/11): e-mails por semana e nível, com a redação do
// planejamento em scripts/data/calendario-ofertao.json (extraída do site do calendário).
// Pastas: "semana S-nN" com uma versão por empreendimento (semanas 1 a 3) ou por
// empreendimento e dia (semana 4); "semana 4-n0" com a versão geral e "semana 4-agendados"
// com a confirmação para quem já tem horário (substitui o convite do dia).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT, EMPREENDIMENTOS, FONTE_TEXTO, IMG, OFERTAO, RDR,
  p, caixaApoio, caixaServico, blocoBanner, blocoTraco, documento, gravar,
  CSS_CAIXA_EVENTO, CSS_COLUNAS,
} from '../lib/base.mjs';

const FONTE = 'scripts/emails/calendario-ofertao.mjs';
const DADOS = JSON.parse(readFileSync(join(ROOT, 'scripts', 'data', 'calendario-ofertao.json'), 'utf8'));
const NIVEIS = Object.fromEntries(DADOS.niveis.map((n) => [n.id, n]));
const PRODUTO = { novo: EMPREENDIMENTOS.enredo, soul: EMPREENDIMENTOS.soul, sun: EMPREENDIMENTOS.sunin };

// Semana 4: dia do disparo → banner (mesmas chaves de CHAMADAS em build-imagens.mjs)
const DIAS = {
  '03': { slug: 'convite', chamada: '05 e 06 de novembro', arquivoN0: '03-11-convite' },
  '04': { slug: 'amanha', chamada: 'É amanhã!', arquivoN0: '04-11-e-amanha' },
  '05': { slug: 'hoje', chamada: 'Começa hoje!', arquivoN0: '05-11-comeca-hoje' },
  '06': { slug: 'ultimo-dia', chamada: 'Último dia!', arquivoN0: '06-11-ultimo-dia' },
};

// ---- Campos do planejamento ([Nome], [Link ...]) → merge tags ----
const tag = (nome) => nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, '_');
const TAGS = [
  [/\[Nome\]/g, '{{NOME}}'],
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

// Box de serviço (Azul Profundo): "Data: x" / "Local: x" / "Horário: x"; linha sem rótulo = datas.
const ICONES = { Data: 'icone-calendario.png', Datas: 'icone-calendario.png', Local: 'icone-local.png', 'Horário': 'icone-horario.png' };
function boxServico(box, { margem = '4px 0 28px 0', fim = '' } = {}) {
  const itens = t(box.text).split('\n').map((l) => {
    const m = l.match(/^(Data|Local|Horário): (.+)$/);
    // data única sem rótulo: "Hoje, 06 de novembro" → só a data (o rótulo já diz "Data")
    const [rotulo, valor] = m ? [m[1], m[2]] : / e |, e /.test(l) ? ['Datas', l] : ['Data', l.replace(/^Hoje, /, '')];
    return [ICONES[rotulo], rotulo, valor];
  });
  return caixaServico(box.title, itens, { margem, fim });
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

// Bloco do empreendimento (convite geral de 03/11): cartão + nome + descrição, sem botão.
function blocoProduto({ name, text }) {
  const e = Object.values(EMPREENDIMENTOS).find((x) => x.nome === name);
  const c = e.caixa;
  return `
              <!-- Bloco ${e.nome} -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0; background-color:${c.fundo}; border-top:4px solid ${e.acento};">
                <tr>
                  <td class="rdr-col" width="264" valign="top" style="width:264px; padding:0; background-color:${RDR.profundo};">
                    <img class="rdr-col-img" src="${IMG}/${e.banner.replace('banner-', 'cartao-')}" width="264" height="220" alt="${e.alt}" style="display:block; width:264px; height:auto; border:0;" />
                  </td>
                  <td class="rdr-col rdr-col-txt" valign="middle" style="padding:24px; background-color:${c.fundo};">
                    <p style="margin:0 0 10px 0; font-family:${FONTE_TEXTO}; font-size:20px; line-height:24px; font-weight:bold; color:${c.texto};">${e.nome}</p>
                    <p style="margin:0; font-family:${FONTE_TEXTO}; font-size:16px; line-height:24px; color:${c.texto};">${text}</p>
                  </td>
                </tr>
              </table>`;
}

const bannerFachada = (e) => blocoBanner({ src: e.banner, alt: e.alt }) + blocoTraco([[e.acento, 600]]);
const bannerDia = (e, dia) =>
  e
    ? blocoBanner({ src: `banner-ofertao-${e.slug}-${dia.slug}.jpg`, alt: `${dia.chamada} Ofertão RDR · ${e.alt}`, altura: 656 }) +
      blocoTraco([[e.acento, 600]])
    : blocoBanner({ src: `banner-ofertao-${dia.slug}.jpg`, alt: `${dia.chamada} Ofertão RDR · RDR Engenharia`, altura: 342 });

const larguraVml = (txt) => Math.max(300, txt.length * 10 + 90);

// ---- Documento ----

const DIA_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const dataLonga = (iso) => `${DIA_SEMANA[new Date(`${iso}T12:00:00`).getDay()]}, ${iso.slice(8)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const codigo = (x, sufixo = '') =>
  `S${x.semana}_${x.nivel}_${x.chave === 'general' ? 'OFERTAO' : tag(x.produto)}_EMAIL_${x.data.slice(8)}${x.data.slice(5, 7)}${sufixo}`;

// c: copy (ou a versão confirmada), x: o envio; versao: rótulo do cabeçalho.
function montar({ x, c, versao, banner, corpo, cta, destino, legais, cssMobile = CSS_CAIXA_EVENTO, sufixo = '', notas = [] }) {
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
      `       Código:      ${codigo(x, sufixo)}`,
      `       Assunto:     ${t(c.subject)}`,
      ...notas.map((n, i) => `       ${i ? '        ' : 'Validar:'}     ${n}`),
    ].join('\n'),
    banner,
    saudacao: t(c.body[0]),
    corpo,
    botao: { texto: cta, link: t(destino), larguraVml: larguraVml(cta) },
    legais,
    cssMobile,
  });
  const vars = [...new Set(html.match(/\{\{[A-Z_]+\}\}/g))];
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
    x, c,
    versao: `Semana ${x.semana} · ${x.nivel} (${NIVEIS[x.nivel].nome}) · ${e.nome}`,
    banner: bannerFachada(e),
    corpo,
    cta: x.cta,
    destino: c.destination,
    legais: [...(c.legal ? [CONDICOES] : []), e.legal],
    notas: [c.validation],
  });
}

// Semana 4: convite, véspera, abertura e último dia (por empreendimento ou geral N0).
function emailEvento(x) {
  const c = x.copy;
  const e = PRODUTO[x.chave];
  const dia = DIAS[x.data.slice(8)];
  const [, ...paragrafos] = c.body.map(t);
  const ultimo = paragrafos.pop();
  const corpo =
    paragrafos.map((txt) => p(txt)).join('') +
    p(ultimo, ' margin-bottom:24px;') +
    (c.products ? c.products.map(blocoProduto).join('') + '\n              ' + p(t(c.closing), ' margin:24px 0 24px 0;') : '') +
    boxServico(c.box);
  return montar({
    x, c,
    versao: e
      ? `Semana 4 · ${x.nivel} (${NIVEIS[x.nivel].nome}) · ${e.nome} · ${x.dia}`
      : `Semana 4 · N0 (todos os leads) · versão geral · ${x.dia}`,
    banner: bannerDia(e, dia),
    corpo,
    cta: x.cta,
    destino: c.destination,
    legais: e ? [e.legal] : Object.values(EMPREENDIMENTOS).map((y) => y.legal),
    cssMobile: CSS_CAIXA_EVENTO + (c.products ? CSS_COLUNAS + `
      .rdr-col-txt { padding:18px 20px 20px 20px !important; }` : ''),
    notas: [c.validation, ...(x.dia === 'Último dia' ? ['Envio complementar: somente para leads ainda não atendidos.'] : [])],
  });
}

// Confirmação para quem já agendou (substitui o convite do dia; igual para todos os níveis).
function emailConfirmado(x) {
  const c = x.copy.confirmed;
  const e = PRODUTO[x.chave];
  const [, ...paragrafos] = c.body.map(t);
  // 05 e 06/11: o atendimento é no próprio dia do envio, então a data vai escrita
  const dd = x.data.slice(8);
  const box = dd === '04' ? c.box : { ...c.box, text: c.box.text.replace('[Data agendada]', `${dd} de novembro`) };
  return montar({
    x: { ...x, nivel: 'AGENDADOS' },
    c,
    versao: `Semana 4 · quem já agendou · ${e ? e.nome : 'versão geral'} · ${x.dia} (substitui o convite)`,
    banner: bannerDia(e, DIAS[x.data.slice(8)]),
    corpo: paragrafos.map((txt, i) => p(txt, i === paragrafos.length - 1 ? ' margin-bottom:24px;' : '')).join('') + boxServico(box, { margem: '4px 0 12px 0' }),
    cta: c.cta,
    destino: c.destination,
    legais: e ? [e.legal] : Object.values(EMPREENDIMENTOS).map((y) => y.legal),
    sufixo: '_CONFIRMADO',
    notas: ['Enviar só para quem tem atendimento agendado; quem recebe esta versão não recebe o convite do dia.'],
  });
}

// ---- Gravação ----

const ORDEM = ['novo', 'soul', 'sun'];
const pastas = new Map();
const add = (pasta, titulo, v) => {
  if (!pastas.has(pasta)) pastas.set(pasta, { titulo, versoes: [] });
  pastas.get(pasta).versoes.push(v);
};

const emails = [...DADOS.emails].sort((a, b) =>
  a.semana - b.semana || a.nivel.localeCompare(b.nivel) || a.data.localeCompare(b.data) || ORDEM.indexOf(a.chave) - ORDEM.indexOf(b.chave));

const confirmados = new Map();
for (const x of emails) {
  const pasta = `semana ${x.semana}-${x.nivel.toLowerCase()}`;
  const titulo = `Semana ${x.semana} · ${x.nivel} · ${NIVEIS[x.nivel].nome}`;
  const e = PRODUTO[x.chave];
  const dd = `${x.data.slice(8)}-${x.data.slice(5, 7)}`;
  if (x.semana < 4) {
    add(pasta, titulo, { arquivo: `${e.slug}.html`, rotulo: e.nome, html: emailSemana(x) });
  } else {
    add(pasta, titulo, {
      arquivo: e ? `${dd}-${e.slug}.html` : `${DIAS[x.data.slice(8)].arquivoN0}.html`,
      rotulo: `${dd.replace('-', '/')} · ${x.dia}${e ? ` · ${e.nome}` : ''}`,
      html: emailEvento(x),
    });
    if (x.copy.confirmed && !confirmados.has(dd + x.chave)) confirmados.set(dd + x.chave, x);
  }
}
for (const x of confirmados.values()) {
  const e = PRODUTO[x.chave];
  const dd = `${x.data.slice(8)}-${x.data.slice(5, 7)}`;
  add('semana 4-agendados', 'Semana 4 · Quem já agendou (substitui o convite do dia)', {
    arquivo: `${dd}-${e ? e.slug : 'geral'}.html`,
    rotulo: `${dd.replace('-', '/')} · ${e ? e.nome : 'Versão geral'}`,
    html: emailConfirmado(x),
  });
}
pastas.get('semana 4-agendados').versoes.sort((a, b) => a.arquivo.localeCompare(b.arquivo));

for (const [pasta, { titulo, versoes }] of pastas) gravar(pasta, titulo, versoes);
