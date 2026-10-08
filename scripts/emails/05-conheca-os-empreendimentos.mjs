// E-mail 05 "Conheça os empreendimentos da RDR": versão única, apresenta os três produtos.
// Abertura com a marca RDR; um bloco por empreendimento (cartão da fachada + texto na cor
// de apoio do KV), lado a lado no desktop e empilhado no celular; um botão por produto.
import {
  EMPREENDIMENTOS, FONTE_TEXTO, IMG, RDR,
  p, documento, gravar,
} from '../lib/base.mjs';

const { soul, sunin, enredo } = EMPREENDIMENTOS;

const PRODUTOS = [
  { e: soul, texto: '2 quartos no Fonseca, em Niterói, com lazer no condomínio.', link: '{{LINK_SOUL_FONSECA}}' },
  { e: sunin, texto: 'studios no Ingá, em Niterói, com lazer no rooftop.', link: '{{LINK_SUN_IN}}' },
  { e: enredo, texto: '2 quartos na Vila Isabel, no Rio, com lazer no condomínio.', link: '{{LINK_NOVO_ENREDO}}' },
];

const abertura = `
          <!-- ============ ABERTURA: MARCA RDR ============ -->
          <tr>
            <td style="padding:0; background-color:${RDR.profundo};">
              <img class="rdr-full" src="${IMG}/banner-rdr-marca.jpg" width="600" height="220" alt="RDR Engenharia" style="display:block; width:600px; max-width:100%; height:auto; border:0;" />
            </td>
          </tr>`;

// Bloco do empreendimento: cartão (fachada + marca) à esquerda, texto na cor de apoio à direita.
function bloco({ e, texto }) {
  const c = e.caixa;
  const cartao = e.banner.replace('banner-', 'cartao-');
  return `
              <!-- Bloco ${e.nome}: identidade do KV -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;">
                <tr>
                  <td class="rdr-col" width="264" valign="top" style="width:264px; padding:0; background-color:${RDR.profundo};">
                    <img class="rdr-col-img" src="${IMG}/${cartao}" width="264" height="220" alt="${e.alt}" style="display:block; width:264px; height:auto; border:0;" />
                  </td>
                  <td class="rdr-col rdr-col-txt" valign="middle" style="padding:24px 24px 24px 24px; background-color:${c.fundo}; border-top:4px solid ${e.acento};">
                    <p style="margin:0 0 8px 0; font-family:${FONTE_TEXTO}; font-size:20px; line-height:24px; font-weight:bold; color:${c.texto};">${e.nome}</p>
                    <p style="margin:0; font-family:${FONTE_TEXTO}; font-size:16px; line-height:24px; color:${c.texto};">${texto.charAt(0).toUpperCase() + texto.slice(1)}</p>
                  </td>
                </tr>
              </table>`;
}

// Três botões, um por linha, na largura do corpo e com o texto centralizado;
// o traço do produto à esquerda identifica cada um.
function botoes() {
  const botao = ({ e, link }, ultimo) => `
              <!--[if mso]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${link}" style="height:60px; v-text-anchor:middle; width:504px;" stroke="f" fillcolor="${RDR.azul}">
                <w:anchorlock/>
                <center style="color:#FFFFFF; font-family:Arial, sans-serif; font-size:17px; font-weight:bold;">Quero conhecer o ${e.nome} &rarr;</center>
              </v:rect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a class="rdr-btn" href="${link}" target="_blank" style="display:block; text-align:center; background-color:${RDR.azul}; border-left:6px solid ${e.acento}; color:#FFFFFF; font-family:${FONTE_TEXTO}; font-size:17px; line-height:20px; font-weight:bold; letter-spacing:0.2px; text-decoration:none; padding:20px 24px; mso-hide:all;">Quero conhecer o ${e.nome}&nbsp;&nbsp;&rarr;</a>
              <!--<![endif]-->${ultimo ? '' : `
              <div style="height:12px; line-height:12px; font-size:0;">&nbsp;</div>`}`;
  return `
          <!-- ============ BOTÕES (um por empreendimento) ============ -->
          <tr>
            <td class="rdr-gutter" align="left" style="padding:8px 48px 56px 48px;">${PRODUTOS.map((x, i) => botao(x, i === PRODUTOS.length - 1)).join('')}
            </td>
          </tr>`;
}

const html = documento({
  email: '05 · Conheça os empreendimentos da RDR',
  fonte: 'scripts/emails/05-conheca-os-empreendimentos.mjs',
  variaveis: ['{{NOME}}', ...PRODUTOS.map((x) => x.link), '{{LINK_DESCADASTRO}}'],
  titulo: 'Conheça os empreendimentos da RDR',
  assunto: 'Conheça os empreendimentos da RDR',
  preheader: 'Soul Fonseca, Sun In e Novo Enredo: três opções para seus próximos planos.',
  cabecalho: `       Versão:      única (apresenta Soul Fonseca, Sun In e Novo Enredo)
       Assunto:     Conheça os empreendimentos da RDR
       Específicas: nenhuma`,
  banner: abertura,
  corpo:
    p('Somos a RDR Engenharia. Conheça três opções para seus próximos planos:', ' margin-bottom:24px;') +
    PRODUTOS.map(bloco).join('') +
    '\n              ' +
    p('Escolha abaixo o empreendimento que quer conhecer.', ' margin:12px 0 12px 0;'),
  acoes: botoes(),
  legais: PRODUTOS.map((x) => x.e.legal),
  // no celular, cartão em cima e texto embaixo; botões na largura toda
  cssMobile: `
      .rdr-col     { display:block !important; width:100% !important; }
      .rdr-col-img { width:100% !important; height:auto !important; }
      .rdr-col-txt { padding:18px 20px 20px 20px !important; }
      a.rdr-btn    { font-size:16px !important; }
      /* "EMPREENDIMENTOS" não cabe a 34px em 327px de largura */
      .rdr-titulo  { font-size:28px !important; line-height:32px !important; }`,
});

gravar('05-conheca-os-empreendimentos', '05 · Conheça os empreendimentos da RDR', [
  { arquivo: 'email.html', rotulo: 'Versão única', html },
]);
