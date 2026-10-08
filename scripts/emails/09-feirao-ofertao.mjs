// E-mail 09 "Venha encontrar uma opção para seus planos" (Ofertão RDR · Feirão de imóveis): versão única.
// Banner do Feirão (Ofertão + "Feirão de imóveis" + assinatura RDR); caixa Azul Profundo com o evento.
import {
  EMPREENDIMENTOS, OFERTAO, BANNER_FEIRAO,
  p, caixaEvento, CSS_CAIXA_EVENTO, documento, gravar,
} from '../lib/base.mjs';


const titulo = 'Venha encontrar uma opção para seus planos';

const html = documento({
  email: '09 · Venha encontrar uma opção para seus planos (Ofertão RDR · Feirão de imóveis)',
  fonte: 'scripts/emails/09-feirao-ofertao.mjs',
  variaveis: ['{{NOME}}', OFERTAO.local, OFERTAO.horarios, '{{LINK_OFERTAO}}', '{{LINK_DESCADASTRO}}'],
  titulo,
  assunto: titulo,
  preheader: 'A RDR vai realizar o Ofertão, um feirão de ofertas para quem está buscando um imóvel.',
  cabecalho: `       Versão:      única
       Assunto:     ${titulo}
       Específicas: ${OFERTAO.local} · ${OFERTAO.horarios}`,
  banner: BANNER_FEIRAO,
  saudacao: 'Olá, {{NOME}}, tudo bem?',
  corpo:
    p('A RDR vai realizar o Ofertão, um feirão de ofertas para quem está buscando um imóvel.') +
    p('Você poderá conhecer melhor nossos empreendimentos, comparar as opções e conversar com a equipe sobre valores, entrada e possibilidades de financiamento.') +
    p('É uma oportunidade para esclarecer suas dúvidas e conferir quais opções de compra fazem sentido para você.', ' margin-bottom:24px;') +
    caixaEvento('Programe sua visita'),
  botao: { texto: 'Quero participar do Ofertão', link: '{{LINK_OFERTAO}}', larguraVml: 340 },
  legais: Object.values(EMPREENDIMENTOS).map((e) => e.legal),
  cssMobile: CSS_CAIXA_EVENTO,
});

gravar('09-feirao-ofertao', '09 · Venha encontrar uma opção para seus planos', [
  { arquivo: 'email.html', rotulo: 'Versão única', html },
]);
