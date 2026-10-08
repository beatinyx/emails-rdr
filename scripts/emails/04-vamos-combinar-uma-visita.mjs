// E-mail 04 "Vamos combinar uma visita?" (Ofertão RDR): 3 versões por empreendimento + sem produto.
// Reaproveita o banner do Ofertão e a caixa Azul Profundo do convite (e-mail 02).
import {
  EMPREENDIMENTOS, OFERTAO, TRACO_TRES,
  p, destaque, linhaIcone as linha, caixaEncontro, CSS_CAIXA_ENCONTRO, blocoBannerOfertao, blocoLegendas, blocoTraco, documento, gravar,
} from '../lib/base.mjs';

const DATA = OFERTAO.data;
const LOCAL = OFERTAO.localAtendimento;

const BASE = {
  email: '04 · Vamos combinar uma visita? (Ofertão RDR)',
  fonte: 'scripts/emails/04-vamos-combinar-uma-visita.mjs',
  titulo: 'Vamos combinar uma visita?',
  assunto: 'Vamos combinar uma visita?',
  botao: { texto: 'Quero escolher um horário', link: '{{LINK_HORARIO}}', larguraVml: 340 },
  cssMobile: CSS_CAIXA_ENCONTRO,
};

const versoes = Object.values(EMPREENDIMENTOS).map((e) => ({
  arquivo: `${e.slug}.html`,
  rotulo: e.nome,
  html: documento({
    ...BASE,
    variaveis: ['{{NOME}}', LOCAL, '{{LINK_HORARIO}}', '{{LINK_DESCADASTRO}}'],
    preheader: `Conheça o ${e.nome} no próximo encontro da RDR e tire suas dúvidas com um corretor.`,
    cabecalho: `       Versão:      ${e.nome}
       Assunto:     ${BASE.assunto}
       Específicas: ${LOCAL} (local do atendimento deste empreendimento)`,
    banner: blocoBannerOfertao(e.banner, e.alt) + blocoTraco([[e.acento, 600]]),
    corpo:
      caixaEncontro(
        linha('icone-calendario.png', 'Data', DATA) + linha('icone-local.png', 'Local', LOCAL, true),
        `O próximo encontro da RDR será em ${destaque(DATA)}, em ${destaque(LOCAL)}. Você pode conhecer o ${e.nome} e tirar suas dúvidas com um corretor.`,
      ) +
      '\n              ' +
      p('Venha conferir nossas opções, escolha um horário para o atendimento.', ' margin-bottom:12px;'),
    legais: [e.legal],
  }),
}));

versoes.push({
  arquivo: 'sem-produto.html',
  rotulo: 'Sem produto identificado',
  html: documento({
    ...BASE,
    variaveis: ['{{NOME}}', '{{LINK_HORARIO}}', '{{LINK_DESCADASTRO}}'],
    preheader: 'Conheça as opções da RDR no próximo encontro e tire suas dúvidas com um corretor.',
    cabecalho: `       Versão:      sem produto identificado (Soul Fonseca, Sun In e Novo Enredo)
       Assunto:     ${BASE.assunto}
       Específicas: nenhuma`,
    banner:
      blocoBannerOfertao(
        'banner-rdr-opcoes.jpg',
        'fachadas do Soul Fonseca, no Fonseca; do Sun In, no Ingá; e do Novo Enredo, em Vila Isabel',
      ) +
      blocoTraco(TRACO_TRES) +
      blocoLegendas(),
    corpo:
      caixaEncontro(
        linha('icone-calendario.png', 'Data', DATA, true),
        `O próximo encontro da RDR será em ${destaque(DATA)}. Você pode conhecer nossas opções e tirar suas dúvidas com um corretor.`,
      ) +
      '\n              ' +
      p('Escolha o empreendimento para conferir o local e os horários de atendimento.', ' margin-bottom:12px;'),
    legais: Object.values(EMPREENDIMENTOS).map((e) => e.legal),
  }),
});

gravar('04-vamos-combinar-uma-visita', '04 · Vamos combinar uma visita?', versoes);
