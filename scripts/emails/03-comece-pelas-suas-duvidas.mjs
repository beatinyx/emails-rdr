// E-mail 03 "Comece pelas suas dúvidas": 3 versões por empreendimento + sem produto.
// Reaproveita os banners, o traço e as caixas de apoio do e-mail 01.
import {
  EMPREENDIMENTOS, RDR, TRACO_TRES,
  p, caixaApoio, blocoBanner, blocoLegendas, blocoTraco, documento, gravar,
} from '../lib/base.mjs';

const BASE = {
  email: '03 · Comece pelas suas dúvidas',
  fonte: 'scripts/emails/03-comece-pelas-suas-duvidas.mjs',
  variaveis: ['{{NOME}}', '{{LINK_SIMULACAO}}', '{{LINK_DESCADASTRO}}'],
  titulo: 'Comece pelas suas dúvidas',
  assunto: 'Comece pelas suas dúvidas',
  botao: { texto: 'Quero uma simulação', link: '{{LINK_SIMULACAO}}' },
};

const ATENDIMENTO = p('Se quiser conhecer pessoalmente, teremos atendimento entre 22 e 29/10.', ' margin-bottom:12px;');

const versoes = Object.values(EMPREENDIMENTOS).map((e) => ({
  arquivo: `${e.slug}.html`,
  rotulo: e.nome,
  html: documento({
    ...BASE,
    preheader: `Antes de visitar o ${e.nome}, peça uma simulação e tire suas dúvidas com um corretor.`,
    cabecalho: `       Versão:      ${e.nome}
       Assunto:     ${BASE.assunto}
       Específicas: ${e.atributo.startsWith('{{') ? e.atributo : 'nenhuma (atributo já preenchido)'}`,
    banner: blocoBanner({ src: e.banner, alt: e.alt }) + blocoTraco([[e.acento, 600]]),
    corpo:
      p(`Antes de marcar uma visita ao ${e.nome}, você pode conhecer as opções e pedir uma simulação.`) +
      caixaApoio(e.caixa, e.atributo, { comentario: `Atributo do empreendimento: cor de apoio do KV ${e.nome}` }) +
      '\n              ' +
      p('Um corretor confere as condições vigentes e explica os próximos passos para você comparar as opções e entender os valores.') +
      ATENDIMENTO,
    legais: [e.legal],
  }),
}));

// Sem produto: a caixa apresenta os três, com os nomes em negrito para facilitar a identificação.
const { soul, sunin, enredo } = EMPREENDIMENTOS;
const nome = (e) => `<strong style="color:${RDR.profundo};">${e.nome}</strong>`;

versoes.push({
  arquivo: 'sem-produto.html',
  rotulo: 'Sem produto identificado',
  html: documento({
    ...BASE,
    preheader: 'Escolha uma opção da RDR e peça uma simulação antes de decidir pela visita.',
    cabecalho: `       Versão:      sem produto identificado (Soul Fonseca, Sun In e Novo Enredo)
       Assunto:     ${BASE.assunto}
       Específicas: nenhuma`,
    banner:
      blocoBanner({
        src: 'banner-rdr-opcoes.jpg',
        alt: 'Fachadas dos empreendimentos da RDR Engenharia: Soul Fonseca, no Fonseca; Sun In, no Ingá; e Novo Enredo, em Vila Isabel',
      }) +
      blocoTraco(TRACO_TRES) +
      blocoLegendas(),
    corpo:
      p('Você pode escolher uma das opções da RDR e pedir uma simulação antes de decidir por uma visita.') +
      caixaApoio(
        { fundo: RDR.nevoa, barra: RDR.azul, texto: RDR.texto },
        `Temos ${nome(soul)} no Fonseca, ${nome(sunin)} no Ingá e ${nome(enredo)} na Vila Isabel. Um corretor confere as condições vigentes e explica os próximos passos.`,
        { comentario: 'Caixa dos três empreendimentos: Névoa RDR' },
      ) +
      '\n              ' +
      ATENDIMENTO,
    legais: [soul, sunin, enredo].map((e) => e.legal),
  }),
});

gravar('03-comece-pelas-suas-duvidas', '03 · Comece pelas suas dúvidas', versoes);
