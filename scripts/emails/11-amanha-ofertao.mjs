// E-mail 11 "Amanhã é dia de Ofertão RDR": versão única, véspera do evento.
// Banner "É AMANHÃ!" + Ofertão (com a assinatura RDR); caixa do evento com a data de amanhã.
import {
  EMPREENDIMENTOS, IMG, OFERTAO,
  p, caixaEvento, CSS_CAIXA_EVENTO, documento, gravar,
} from '../lib/base.mjs';

const banner = `
          <!-- ============ BANNER: É AMANHÃ! · OFERTÃO RDR ============ -->
          <tr>
            <td style="padding:0; background-color:#FFFFFF;">
              <img class="rdr-full" src="${IMG}/banner-ofertao-amanha.jpg" width="600" height="342" alt="É amanhã! Ofertão RDR · RDR Engenharia" style="display:block; width:600px; max-width:100%; height:auto; border:0;" />
            </td>
          </tr>`;

const titulo = 'Amanhã é dia de Ofertão RDR';

const html = documento({
  email: '11 · Amanhã é dia de Ofertão RDR',
  fonte: 'scripts/emails/11-amanha-ofertao.mjs',
  variaveis: ['{{NOME}}', OFERTAO.local, OFERTAO.horarios, '{{LINK_OFERTAO}}', '{{LINK_DESCADASTRO}}'],
  titulo,
  assunto: titulo,
  preheader: 'É amanhã! Venha ao Ofertão RDR conhecer o Soul Fonseca, o Sun In e o Novo Enredo.',
  cabecalho: `       Versão:      única (véspera: disparar no dia anterior a ${OFERTAO.data})
       Assunto:     ${titulo}
       Específicas: ${OFERTAO.local} · ${OFERTAO.horarios}`,
  banner,
  saudacao: 'Olá, {{NOME}}, tudo bem?',
  corpo:
    p('É amanhã! Gostaríamos de te receber no Ofertão RDR, nosso feirão presencial de imóveis.') +
    p('Venha conhecer melhor o Soul Fonseca, o Sun In e o Novo Enredo, tirar suas dúvidas e conferir os valores e as condições de compra com nossa equipe.') +
    p('Se você está procurando um imóvel, aproveite a visita para comparar as opções e conversar sobre o que precisa para dar o próximo passo.', ' margin-bottom:24px;') +
    caixaEvento('Esperamos você no estande', {
      datas: { rotulo: 'Data', valor: OFERTAO.data },
      margem: '4px 0 28px 0',
    }) +
    '\n              ' +
    p('Escolha um horário disponível ou indique sua preferência para a equipe conferir. Será um prazer te receber!', ' margin-bottom:12px;'),
  botao: { texto: 'Quero ir ao Ofertão', link: '{{LINK_OFERTAO}}', larguraVml: 300 },
  legais: Object.values(EMPREENDIMENTOS).map((e) => e.legal),
  cssMobile: CSS_CAIXA_EVENTO,
});

gravar('11-amanha-ofertao', '11 · Amanhã é dia de Ofertão RDR', [
  { arquivo: 'email.html', rotulo: 'Versão única', html },
]);
