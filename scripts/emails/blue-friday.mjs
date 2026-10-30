// Blue Friday · 30 Dias de Vantagens (01 a 30/11), com a redação do planejamento em
// scripts/data/blue-friday.json (extraída do site do calendário).
// Pastas:
//   "semana 4-nN": ponte para a Blue Friday (29/10), uma versão por empreendimento;
//   "semana 5-nN": abertura (03/11), oferta e botão antes do texto (N0: versão geral);
//   "semana 5-ofertao": modelos do dia presencial, bloqueados até a RDR confirmar data, local e horário.
// Um e-mail por lead em cada data; as versões são alternativas.
// KV: banners da Blue Friday (fundo de linhas, logo e fachada na moldura neon), em build-imagens.mjs.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT, EMPREENDIMENTOS, FONTE_TEXTO, FONTE_DISPLAY, RDR, OFERTAO, TRACO_TRES,
  p, caixaApoio, blocoBanner, blocoTraco, documento, gravar, WHATSAPP, NOME,
} from '../lib/base.mjs';

const FONTE = 'scripts/emails/blue-friday.mjs';
const DADOS = JSON.parse(readFileSync(join(ROOT, 'scripts', 'data', 'blue-friday.json'), 'utf8'));
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

// Azul do neon do KV (moldura e fundo de linhas), para os boxes da campanha.
const BF = { fundo: '#04153D', neon: '#3FB4FF' };

// ---- Campos do planejamento ([Nome], [ MARCAÇÃO — ...], [Inserir ...]) → merge tags ----
const TAGS = [
  [/\[Nome\]/g, NOME],
  [/\[ MARCAÇÃO — DATA APROVADA\]/g, '{{DATA_OFERTAO}}'],
  [/\[ MARCAÇÃO — ESTANDE \/ ENDEREÇO\]/g, OFERTAO.local],
  [/\[ MARCAÇÃO — HORÁRIO\]/g, OFERTAO.horarios],
  [/\[Inserir [^\]]*\]/g, '{{CONDICOES_COMERCIAIS}}'],
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
const chamada = (txt, margem = '28px 0 0 0') => `
              <p style="margin:${margem}; font-family:${FONTE_TEXTO}; font-size:18px; line-height:26px; font-weight:bold; color:${RDR.profundo};">${txt}</p>`;

// Pergunta do N4 ([h2]).
const pergunta = (txt) =>
  `<p style="margin:0 0 6px 0; font-family:${FONTE_TEXTO}; font-size:19px; line-height:26px; font-weight:bold; color:${RDR.profundo};">${txt}</p>`;

// Box do produto (ponte): título em versalete + texto, na cor de apoio do KV do produto.
const boxProduto = (e, { titulo, texto }) =>
  caixaApoio(
    e.caixa,
    `<strong style="display:block; margin:0 0 6px 0; font-size:14px; line-height:20px; letter-spacing:1.2px;">${titulo}</strong>${t(texto)}`,
    { comentario: `Box: ${titulo}` },
  );

// Box da campanha (ponte): convite para a Blue Friday no azul do KV, com o traço neon.
const boxCampanha = ({ titulo, texto }) => `
              <!-- Box da campanha: ${titulo} -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 28px 0;">
                <tr>
                  <td class="rdr-datas" style="padding:26px 28px 28px 28px; background-color:${BF.fundo}; border-top:4px solid ${BF.neon};">
                    <p style="margin:0 0 12px 0; font-family:${FONTE_DISPLAY}; font-size:22px; line-height:28px; font-weight:bold; text-transform:uppercase; color:#FFFFFF;">${titulo}</p>
                    <p style="margin:0; font-family:${FONTE_TEXTO}; font-size:17px; line-height:27px; color:#FFFFFF;">${t(texto)}</p>
                  </td>
                </tr>
              </table>`;

// Foto real da obra: entra só quando validada (direção de arte); fica o lugar marcado.
const fotoObra = ({ descricao, legenda }) => `
              <!-- FOTO DA OBRA (inserir só quando atual e validada): ${descricao} Legenda: "${legenda}". Sem foto aprovada, manter como está. -->`;

function blocoCorpo(b, e, prox) {
  switch (b.tipo) {
    case 'h2': return pergunta(t(b.texto));
    case 'box': return boxProduto(e, b);
    case 'campanha': return boxCampanha(b);
    case 'foto': return fotoObra(b);
    // antes de pergunta ou box, o parágrafo ganha mais respiro
    default: return p(t(b.texto), prox && prox.tipo !== 'texto' ? ' margin-bottom:24px;' : '');
  }
}

const banner = (e) =>
  e
    ? blocoBanner({ src: `banner-bf-${e.slug}.jpg`, alt: `Blue Friday · 30 dias de vantagens · RDR Engenharia · ${e.alt}`, altura: 530 }) +
      blocoTraco([[e.acento, 600]])
    : blocoBanner({ src: 'banner-bf-geral.jpg', alt: 'Blue Friday · 30 dias de vantagens · RDR Engenharia', altura: 320 }) +
      blocoTraco(TRACO_TRES);

const CSS = `
      .rdr-oferta { font-size:26px !important; line-height:30px !important; }
      .rdr-datas  { padding:22px 18px 24px 18px !important; }`;

// ---- Documento ----

const DIA_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const dataLonga = (iso) => `${DIA_SEMANA[new Date(`${iso}T12:00:00`).getDay()]}, ${iso.slice(8)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const tag = (nome) => nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, '_');
const codigo = (x) =>
  `S${x.semana}_${x.nivel}_${x.produto ? tag(x.produto) : 'GERAL'}_${x.data ? `EMAIL_${x.data.slice(8)}${x.data.slice(5, 7)}` : 'OFERTAO_EMAIL_MODELO'}`;

const TIPOS = {
  ponte: 'Ponte para a Blue Friday',
  abertura: 'Abertura da Blue Friday',
  presencial: 'Ofertão, dia presencial da Blue Friday',
};

function email(x) {
  const e = PRODUTO[x.chave];
  const [saudacao, ...resto] = x.corpo;
  const corpo = resto.map((b, i) => blocoCorpo(b, e, resto[i + 1])).join('');
  // abertura e modelos: oferta + chamada + botão antes da saudação; ponte: chamada depois do texto
  const topo = x.ofertas.length
    ? x.ofertas.map((o, i) => blocoOferta(o, { maior: !e && i === 0, margem: i ? '12px 0 0 0' : '4px 0 0 0' })).join('') + chamada(t(x.cta))
    : '';
  const titulo = t(x.titulo);
  const versao =
    `Semana ${x.semana} · ${TIPOS[x.tipo]} · ${x.nivel} (${NIVEIS[x.nivel]}) · ${e ? e.nome : 'versão geral'}` +
    (x.tipo === 'presencial' ? ' · MODELO BLOQUEADO' : '');
  // asterisco no texto → o legal do rodapé ganha a chamada
  const asterisco = /\*/.test(JSON.stringify([x.titulo, x.corpo]));
  const html = documento({
    email: versao,
    fonte: FONTE,
    variaveis: ['@@VARIAVEIS@@'],
    titulo,
    compacto: titulo.length > 34,
    apoio: t(x.apoio),
    assunto: t(x.assunto),
    preheader: t(x.preheader),
    cabecalho: [
      `       Versão:      ${versao}`,
      `       Disparo:     ${x.data ? `${dataLonga(x.data)} (uma versão por lead)` : 'sem data · não programar'}`,
      `       Status:      ${x.status}`,
      `       Código:      ${codigo(x)}`,
      `       Assunto:     ${t(x.assunto)}`,
      `       Validar:     ${x.uso}`,
    ].join('\n'),
    banner: banner(e),
    topo,
    saudacao: t(saudacao.texto),
    corpo: corpo + (topo ? '' : chamada(t(x.cta), '8px 0 4px 0')),
    botao: { texto: x.botao, link: linkWhatsapp(x.whatsapp), larguraVml: 240 },
    legais: [`${asterisco ? '* ' : ''}${t(x.legal)}`, ...(e ? [e.legal] : x.ofertas.map((o) => porNome(o.empreendimento).legal))],
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
  const quando = x.data ? ` (${x.data.slice(8)}/${x.data.slice(5, 7)})` : '';
  const [pasta, titulo] =
    x.tipo === 'presencial'
      ? [`semana ${x.semana}-ofertao`, `Semana ${x.semana} · ${TIPOS.presencial} (modelos bloqueados, data a definir)`]
      : [`semana ${x.semana}-${x.nivel.toLowerCase()}`, `Semana ${x.semana} · ${x.nivel} · ${NIVEIS[x.nivel]} · ${TIPOS[x.tipo]}${quando}`];
  if (!pastas.has(pasta)) pastas.set(pasta, { titulo, versoes: [] });
  pastas.get(pasta).versoes.push({ arquivo: `${e ? e.slug : 'geral'}.html`, rotulo: e ? e.nome : 'Versão geral', html: email(x) });
}
for (const [pasta, { titulo, versoes }] of [...pastas].sort(([a], [b]) => a.localeCompare(b))) gravar(pasta, titulo, versoes);
