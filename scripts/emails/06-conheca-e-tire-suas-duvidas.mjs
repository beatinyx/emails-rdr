// E-mail 06 "Conheça e tire suas dúvidas" (Ofertão RDR): versão única, sem produto.
// Banner do Ofertão com as três fachadas + legenda; caixa Azul Profundo com as datas.
import {
  EMPREENDIMENTOS, TRACO_TRES,
  p, destaque, linhaIcone, caixaEncontro, CSS_CAIXA_ENCONTRO,
  blocoBannerOfertao, blocoLegendas, blocoTraco, documento, gravar,
} from '../lib/base.mjs';

const DATAS = '22 a 29/10'; // período do Ofertão

const html = documento({
  email: '06 · Conheça e tire suas dúvidas (Ofertão RDR)',
  fonte: 'scripts/emails/06-conheca-e-tire-suas-duvidas.mjs',
  variaveis: ['{{NOME}}', '{{LINK_AGENDAMENTO}}', '{{LINK_DESCADASTRO}}'],
  titulo: 'Conheça e tire suas dúvidas',
  assunto: 'Conheça e tire suas dúvidas',
  preheader: 'O Ofertão RDR reúne atendimento para apresentar os empreendimentos e esclarecer suas dúvidas.',
  cabecalho: `       Versão:      única (Soul Fonseca, Sun In e Novo Enredo)
       Assunto:     Conheça e tire suas dúvidas
       Específicas: nenhuma`,
  banner:
    blocoBannerOfertao(
      'banner-rdr-opcoes.jpg',
      'fachadas do Soul Fonseca, no Fonseca; do Sun In, no Ingá; e do Novo Enredo, em Vila Isabel',
    ) +
    blocoTraco(TRACO_TRES) +
    blocoLegendas(),
  corpo:
    p('O Ofertão RDR reúne atendimento para apresentar os empreendimentos e esclarecer suas dúvidas.') +
    // o botão vem logo abaixo da caixa: margem inferior curta
    caixaEncontro(
      linhaIcone('icone-calendario.png', 'Datas', DATAS, true),
      `Os encontros acontecem de ${destaque(DATAS)}. Escolha o empreendimento e a data para conferir o local e os horários disponíveis.`,
      { margem: '4px 0 8px 0' },
    ),
  botao: { texto: 'Quero escolher uma data', link: '{{LINK_AGENDAMENTO}}', larguraVml: 320 },
  legais: Object.values(EMPREENDIMENTOS).map((e) => e.legal),
  cssMobile: CSS_CAIXA_ENCONTRO,
});

gravar('06-conheca-e-tire-suas-duvidas', '06 · Conheça e tire suas dúvidas', [
  { arquivo: 'email.html', rotulo: 'Versão única', html },
]);
