// E-mail 10 "Qual dessas opções combina com seus planos?" (Ofertão RDR · Feirão de imóveis): versão única.
// Banner do Feirão; um box por empreendimento (cartão + texto na cor de apoio do KV + botão
// dentro do box); caixa do evento como lembrete no fim.
import {
  EMPREENDIMENTOS, FONTE_TEXTO, IMG, OFERTAO, RDR, BANNER_FEIRAO,
  p, caixaEvento, CSS_CAIXA_EVENTO, CSS_COLUNAS, documento, gravar,
} from '../lib/base.mjs';

const { soul, sunin, enredo } = EMPREENDIMENTOS;

const PRODUTOS = [
  { e: soul, linhas: ['2 quartos no Fonseca, em Niterói.', 'Lazer completo e exclusivo.'], link: '{{LINK_SOUL_FONSECA}}' },
  { e: sunin, linhas: ['Studios para morar e investir no Ingá, em Niterói.', 'Lazer no rooftop.'], link: '{{LINK_SUN_IN}}' },
  { e: enredo, linhas: ['2 quartos na Vila Isabel, no Rio de Janeiro.', 'Áreas de lazer mobiliadas.'], link: '{{LINK_NOVO_ENREDO}}' },
];

// Botão do produto: Azul RDR na largura do box, traço do produto à esquerda.
const botao = ({ e, link }) => `
                    <!--[if mso]>
                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${link}" style="height:56px; v-text-anchor:middle; width:456px;" stroke="f" fillcolor="${RDR.azul}">
                      <w:anchorlock/>
                      <center style="color:#FFFFFF; font-family:Arial, sans-serif; font-size:16px; font-weight:bold;">Quero conhecer o ${e.nome} &rarr;</center>
                    </v:rect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a class="rdr-btn" href="${link}" target="_blank" style="display:block; text-align:center; background-color:${RDR.azul}; border-left:6px solid ${e.acento}; color:#FFFFFF; font-family:${FONTE_TEXTO}; font-size:16px; line-height:20px; font-weight:bold; letter-spacing:0.2px; text-decoration:none; padding:18px 20px; mso-hide:all;">Quero conhecer o ${e.nome}&nbsp;&nbsp;&rarr;</a>
                    <!--<![endif]-->`;

// Box do empreendimento: cartão à esquerda e texto à direita (empilhados no celular),
// botão embaixo, tudo sobre a cor de apoio do KV. As colunas ficam numa tabela interna
// (como no e-mail 05) para o botão não disputar a largura com elas no celular.
function box(x) {
  const { e, linhas } = x;
  const c = e.caixa;
  return `
              <!-- Box ${e.nome}: identidade do KV -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0; background-color:${c.fundo}; border-top:4px solid ${e.acento};">
                <tr>
                  <td style="padding:0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="rdr-col" width="264" valign="top" style="width:264px; padding:0; background-color:${RDR.profundo};">
                          <img class="rdr-col-img" src="${IMG}/${e.banner.replace('banner-', 'cartao-')}" width="264" height="220" alt="${e.alt}" style="display:block; width:264px; height:auto; border:0;" />
                        </td>
                        <td class="rdr-col rdr-col-txt" valign="middle" style="padding:24px 24px 24px 24px; background-color:${c.fundo};">
                          <p style="margin:0 0 10px 0; font-family:${FONTE_TEXTO}; font-size:20px; line-height:24px; font-weight:bold; color:${c.texto};">${e.nome}</p>
                          ${linhas.map((l) => `<p style="margin:0 0 4px 0; font-family:${FONTE_TEXTO}; font-size:16px; line-height:24px; color:${c.texto};">${l}</p>`).join('\n                          ')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="rdr-box-btn" style="padding:24px 24px 24px 24px; background-color:${c.fundo};">${botao(x)}
                  </td>
                </tr>
              </table>`;
}

const titulo = 'Qual dessas opções combina com seus planos?';

const html = documento({
  email: '10 · Qual dessas opções combina com seus planos? (Ofertão RDR · Feirão de imóveis)',
  fonte: 'scripts/emails/10-qual-opcao-combina.mjs',
  variaveis: ['{{NOME}}', OFERTAO.local, OFERTAO.horarios, ...PRODUTOS.map((x) => x.link), '{{LINK_DESCADASTRO}}'],
  titulo,
  assunto: titulo,
  preheader: 'No Ofertão RDR, conheça três empreendimentos e converse com nossa equipe sobre as possibilidades de compra.',
  cabecalho: `       Versão:      única
       Assunto:     ${titulo}
       Específicas: ${OFERTAO.local} · ${OFERTAO.horarios}`,
  banner: BANNER_FEIRAO,
  saudacao: 'Olá, {{NOME}}, tudo bem?',
  corpo:
    p('No Ofertão RDR, você poderá conhecer melhor três empreendimentos e conversar com nossa equipe sobre as possibilidades de compra.') +
    p('Confira as opções e escolha qual gostaria de conhecer:', ' margin-bottom:24px;') +
    PRODUTOS.map(box).join('') +
    caixaEvento('Vamos conversar no Ofertão RDR?', {
      fim: 'Escolha um dos empreendimentos acima para agendar seu atendimento.',
      margem: '12px 0 0 0',
    }),
  // sem botão principal: cada box tem o seu; só o respiro antes do rodapé
  acoes: `
          <tr>
            <td style="padding:0; height:56px; line-height:56px; font-size:0;">&nbsp;</td>
          </tr>`,
  legais: PRODUTOS.map((x) => x.e.legal),
  cssMobile:
    CSS_CAIXA_EVENTO +
    CSS_COLUNAS +
    `
      .rdr-col-txt { padding:18px 20px 18px 20px !important; }
      .rdr-box-btn { padding:6px 20px 20px 20px !important; }
      /* botão dentro do box: cabe em uma linha a 287px */
      .rdr-box-btn a.rdr-btn { font-size:15px !important; padding-left:12px !important; padding-right:12px !important; }
      .rdr-titulo  { font-size:30px !important; line-height:34px !important; }`,
});

gravar('10-qual-opcao-combina', '10 · Qual dessas opções combina com seus planos?', [
  { arquivo: 'email.html', rotulo: 'Versão única', html },
]);
