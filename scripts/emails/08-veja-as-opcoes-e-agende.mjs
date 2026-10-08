// E-mail 08 "Veja as opções e agende sua visita" (Ofertão RDR): versão única, sem produto.
// Banner do Ofertão com as três fachadas + legenda; caixa do encontro com a próxima data.
import {
  EMPREENDIMENTOS, OFERTAO, TRACO_TRES,
  p, destaque, linhaIcone, caixaEncontro, CSS_CAIXA_ENCONTRO,
  blocoBannerOfertao, blocoLegendas, blocoTraco, documento, gravar,
} from '../lib/base.mjs';

const DATA = OFERTAO.data;

const html = documento({
  email: '08 · Veja as opções e agende sua visita (Ofertão RDR)',
  fonte: 'scripts/emails/08-veja-as-opcoes-e-agende.mjs',
  variaveis: ['{{NOME}}', '{{LINK_AGENDAMENTO}}', '{{LINK_DESCADASTRO}}'],
  titulo: 'Veja as opções e agende sua visita',
  assunto: 'Veja as opções e agende sua visita',
  preheader: `O próximo encontro da RDR será em ${DATA}. Escolha o empreendimento e combine um horário.`,
  cabecalho: `       Versão:      única (Soul Fonseca, Sun In e Novo Enredo)
       Assunto:     Veja as opções e agende sua visita
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
      linhaIcone('icone-calendario.png', 'Data', DATA, true),
      `O próximo encontro da RDR será em ${destaque(DATA)}. Você pode conhecer nossas opções e tirar suas dúvidas com a equipe.`,
    ) +
    '\n              ' +
    p('Escolha o empreendimento para conferir onde será o atendimento e combinar um horário.', ' margin-bottom:12px;'),
  botao: { texto: 'Quero agendar uma visita', link: '{{LINK_AGENDAMENTO}}', larguraVml: 320 },
  legais: Object.values(EMPREENDIMENTOS).map((e) => e.legal),
  cssMobile: CSS_CAIXA_ENCONTRO,
});

gravar('08-veja-as-opcoes-e-agende', '08 · Veja as opções e agende sua visita', [
  { arquivo: 'email.html', rotulo: 'Versão única', html },
]);
