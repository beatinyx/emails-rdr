// E-mail 07 "Conheça o [Empreendimento]" / "Qual opção você quer conhecer?": 3 versões + sem produto.
// Banner do KV de cada produto (e-mail 01); caixa do encontro com data e local (e-mail 04).
import {
  EMPREENDIMENTOS, OFERTAO, RDR, TRACO_TRES,
  p, destaque, linhaIcone, caixaEncontro, CSS_CAIXA_ENCONTRO,
  blocoBanner, blocoLegendas, blocoTraco, documento, gravar,
} from '../lib/base.mjs';

const DATA = OFERTAO.data;
const LOCAL = OFERTAO.localAtendimento;

const BASE = {
  email: '07 · Conheça o empreendimento (Ofertão RDR)',
  fonte: 'scripts/emails/07-conheca-o-empreendimento.mjs',
  botao: { texto: 'Quero escolher um horário', link: '{{LINK_AGENDAMENTO}}', larguraVml: 340 },
  cssMobile: CSS_CAIXA_ENCONTRO,
};

const versoes = Object.values(EMPREENDIMENTOS).map((e) => {
  const titulo = `Conheça o ${e.nome}`;
  return {
    arquivo: `${e.slug}.html`,
    rotulo: e.nome,
    html: documento({
      ...BASE,
      variaveis: ['{{NOME}}', LOCAL, '{{LINK_AGENDAMENTO}}', '{{LINK_DESCADASTRO}}'],
      titulo,
      assunto: titulo,
      preheader: `Em ${DATA}, conheça o ${e.nome} e converse com um corretor.`,
      cabecalho: `       Versão:      ${e.nome}
       Assunto:     ${titulo}
       Específicas: ${LOCAL} (local do atendimento deste empreendimento)`,
      banner: blocoBanner({ src: e.banner, alt: e.alt }) + blocoTraco([[e.acento, 600]]),
      corpo:
        p(`Vale conhecer este ponto do ${e.nome}: ${e.argumento}`) +
        caixaEncontro(
          linhaIcone('icone-calendario.png', 'Data', DATA) + linhaIcone('icone-local.png', 'Local', LOCAL, true),
          `Em ${destaque(DATA)}, você pode conhecer melhor essa opção e conversar com um corretor em ${destaque(LOCAL)}. Escolha um horário para o atendimento.`,
          { margem: '4px 0 8px 0' },
        ),
      legais: [e.legal],
    }),
  };
});

const { soul, sunin, enredo } = EMPREENDIMENTOS;
const nome = (e) => `<strong style="color:${RDR.profundo};">${e.nome}</strong>`;

versoes.push({
  arquivo: 'sem-produto.html',
  rotulo: 'Sem produto identificado',
  html: documento({
    ...BASE,
    variaveis: ['{{NOME}}', '{{LINK_AGENDAMENTO}}', '{{LINK_DESCADASTRO}}'],
    titulo: 'Qual opção você quer conhecer?',
    assunto: 'Qual opção você quer conhecer?',
    preheader: `Em ${DATA}, teremos atendimento para apresentar as opções da RDR.`,
    cabecalho: `       Versão:      sem produto identificado (Soul Fonseca, Sun In e Novo Enredo)
       Assunto:     Qual opção você quer conhecer?
       Específicas: nenhuma`,
    banner:
      blocoBanner({
        src: 'banner-rdr-opcoes.jpg',
        alt: 'Fachadas dos empreendimentos da RDR Engenharia: Soul Fonseca, no Fonseca; Sun In, no Ingá; e Novo Enredo, em Vila Isabel',
      }) +
      blocoTraco(TRACO_TRES) +
      blocoLegendas(),
    corpo:
      p(`${nome(soul)} no Fonseca, ${nome(sunin)} no Ingá e ${nome(enredo)} na Vila Isabel: escolha o empreendimento que quer conhecer.`) +
      caixaEncontro(
        linhaIcone('icone-calendario.png', 'Data', DATA, true),
        `Em ${destaque(DATA)}, teremos atendimento para apresentar as opções e esclarecer suas dúvidas. Confira o local e os horários do produto escolhido.`,
        { margem: '4px 0 8px 0' },
      ),
    legais: [soul, sunin, enredo].map((e) => e.legal),
  }),
});

gravar('07-conheca-o-empreendimento', '07 · Conheça o empreendimento', versoes);
